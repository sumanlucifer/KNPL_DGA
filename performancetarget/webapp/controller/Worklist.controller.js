sap.ui.define(
    [
        "./BaseController",
        "sap/ui/model/json/JSONModel",
        "../model/formatter",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/MessageBox",
        "sap/ui/core/Fragment",
        "sap/ui/model/Sorter",
        "sap/ui/Device",
        "sap/m/MessageToast"
    ],
    function (
        BaseController,
        JSONModel,
        formatter,
        Filter,
        FilterOperator,
        MessageBox,
        Fragment,
        Sorter,
        Device,
        MessageToast
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.dga.performancetarget.controller.Worklist", {
            formatter: formatter,

            /* =========================================================== */
            /* lifecycle methods                                           */
            /* =========================================================== */

            /**
             * Called when the worklist controller is instantiated.
             * @public
             */
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                var oDataControl = {
                    filterBar: {
                        StartDate: null,
                        EndDate: null,
                        Mode: "",
                        ZoneId: "",
                        DivisionId: "",
                        DepotId: "",

                    },
                    PageBusy: true
                };


                var oMdlCtrl = new JSONModel(oDataControl);
                this.getView().setModel(oMdlCtrl, "oModelControl");
                // var startupParams;
                // if (this.getOwnerComponent().getComponentData()) {
                //     startupParams = this.getOwnerComponent().getComponentData().startupParameters;
                // }
                // // console.log(startupParams);
                // if (startupParams) {
                //     if (startupParams.hasOwnProperty("DgaId")) {
                //         if (startupParams["DgaId"].length > 0) {
                //             this._onNavToDetails(startupParams["DgaId"][0]);
                //         }
                //     }
                // }
                oRouter
                    .getRoute("worklist")
                    .attachMatched(this._onRouteMatched, this);



            },
            _ResetFilterBar: function () {
                var aCurrentFilterValues = [];
                var aResetProp = {
                    StartDate: null,
                    Status: "",
                    Search: "",
                    Mode: "",
                    ZoneId: "",
                    DivisionId: "",
                    DepotId: "",

                };
                var oViewModel = this.getView().getModel("oModelControl");
                oViewModel.setProperty("/filterBar", aResetProp);
                var oTable = this.getView().byId("idWorkListTable1");
                oTable.rebindTable();

            },
            _onRouteMatched: function () {
                this._InitData();
            },
            onPressAddObject: function () {
                /*
                 * Author: manik saluja
                 * Date: 02-Dec-2021
                 * Language:  JS
                 * Purpose: Navigation to add object view and controller
                 */
                var oRouter = this.getOwnerComponent().getRouter();
                var sKey = this.getView().byId("iconTabBar").getSelectedKey();
                var sTab;
                switch (sKey) {

                    case "0":
                        sTab = "Lead Visit";
                        break;
                    case "1":
                        sTab = "New Lead";
                        break;

                    case "2":
                        sTab = "Contractor Visit";
                        break;

                    case "3":
                        sTab = "Dealer Visit";
                        break;

                    case "4":
                        sTab = "Lead Conversion";
                        break;
                    case "5":
                        sTab = "Business Generation";
                        break;


                }
                oRouter.navTo("Add",
                    {
                        Tab: sTab

                    }
                );

            },
            _InitData: function () {

                /*
                 * Author: manik saluja
                 * Date: 02-Dec-2021
                 * Language:  JS
                 * Purpose: once the view elements load we have to 
                 * 1. get the logged in users informaion. 2.rebind the table to load data and apply filters 3. perform other operations that are required at the time 
                 * of loading the application
                 */

                var othat = this;
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var c1, c2, c3, c4;
                oModelControl.setProperty("/PageBusy", true)
                // c1 = othat._addSearchFieldAssociationToFB();
                // c1.then(function () {
                c2 = othat._dummyPromise();
                c2.then(function () {
                    c3 = othat._initTableData();
                    c3.then(function () {
                        oModelControl.setProperty("/PageBusy", false)
                    })
                })
                // })

            },

            // onIcnTbarChange: function (oEvent) {
            //     var sKey = oEvent.getSource().getSelectedKey();
            //     var oView = this.getView();
            //     if (sKey == "0") {
            //         oView.byId("LeadVisitTable").rebindTable();
            //     }
            //     else if (sKey == "1"){
            //         oView.byId("NewLeadTable").rebindTable();
            //     }
            //     else if (sKey == "2"){
            //         oView.byId("ContractorVisitCountTable").rebindTable();
            //     }
            //     else if (sKey == "3"){
            //         oView.byId("NewLead").rebindTable();
            //     }
            //     else if (sKey == "4"){
            //         oView.byId("LeadConversionTable").rebindTable();
            //     }   
            // else if (sKey == "5"){
            //         oView.byId("BusinessGenerationTable").rebindTable();
            //     }             
            // },

            _addSearchFieldAssociationToFB: function () {
                /*
                 * Author: manik saluja
                 * Date: 02-Dec-2021
                 * Language:  JS
                 * Purpose: add the search field in the filter bar in the view.
                 */
                var promise = jQuery.Deferred();
                let oFilterBar = this.getView().byId("filterbar");
                let oSearchField = oFilterBar.getBasicSearch();
                var oBasicSearch;
                var othat = this;
                if (!oSearchField) {
                    // @ts-ignore
                    oBasicSearch = new sap.m.SearchField({
                        value: "{oModelControl>/filterBar/Search}",
                        showSearchButton: true,
                        search: othat.onFilterBarSearch.bind(othat)
                    });
                    oFilterBar.setBasicSearch(oBasicSearch);
                }
                promise.resolve();
                return promise;

            },
            _getLoggedInInfo: function () {
                /*
                 * Author: manik saluja
                 * Date: 02-Dec-2021
                 * Language:  JS
                 * Purpose: getting the logged in details of the user
                 */
                var promise = jQuery.Deferred();
                var oView = this.getView()
                var oData = oView.getModel();
                var oLoginModel = oView.getModel("LoginInfo");
                var oLoginData = oLoginModel.getData()
                if (Object.keys(oLoginData).length === 0) {
                    return new Promise((resolve, reject) => {
                        oData.callFunction("/GetLoggedInAdmin", {
                            method: "GET",
                            urlParameters: {
                                $expand: "UserType",
                            },
                            success: function (data) {
                                if (data.hasOwnProperty("results")) {
                                    if (data["results"].length > 0) {
                                        oLoginModel.setData(data["results"][0]);
                                    }
                                }
                                resolve();
                            },
                        });
                    })
                } else {
                    promise.resolve();
                    return promise;
                }

            },
            _initTableData: function () {
                /*
                 * Author: Mamta Singh
                 * Date: 20-June-2022
                 * Language:  JS
                 * Purpose: Used to load the table data and trigger the on before binding method.
                 */
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                if (oView.byId("LeadVisitTable")) {
                    oView.byId("LeadVisitTable").rebindTable();
                }
                promise.resolve();
                return promise;
            },
            onBindTargetHistoryList: function (oEvent) {
                /*
                 * Author: Mamta Singh
                 * Date: 20-June-2022
                 * Language:  JS
                 * Purpose: init binding method for the table.
                 */
                var oBindingParams = oEvent.getParameter("bindingParams");
                  oBindingParams.parameters["expand"] = "DGAType,PerformanceZone,PerformanceDivision,PerformanceDepot";
               // oBindingParams.sorter.push(new Sorter("CreatedAt", true));
                // oBindingParams.filters.push(
                //     new sap.ui.model.Filter(
                //         "TargetTypeId",
                //         sap.ui.model.FilterOperator.EQ,
                //         2
                //     )

                // );
                // Apply Filters
                var oFilter = this._CreateFilter();
                if (oFilter) {
                    oBindingParams.filters.push(oFilter);
                }

            },
            onFilterBarSearch: function () {
                var oView = this.getView();
                oView.byId("idWorkListTable1").rebindTable();
            },
            _CreateFilter: function () {
                var aCurrentFilterValues = [];
                var oViewFilter = this.getView()
                    .getModel("oModelControl")
                    .getProperty("/filterBar");

                var aFlaEmpty = false;
                // init filters - is archived and complaint type id is 1
                aCurrentFilterValues.push(
                     new Filter("TargetTypeId",
                     sap.ui.model.FilterOperator.EQ,
                     2));
                    //  aCurrentFilterValues.push(
                    //     new Filter("TargetTypeId",
                    //     sap.ui.model.FilterOperator.EQ,
                    //     3));

                // filter bar filters
                for (let prop in oViewFilter) {
                    if (oViewFilter[prop]) {
                        if (prop === "StartDate") {
                            // converstions are made as the difference between utc and the server time
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("CreatedAt", FilterOperator.GE, new Date(oViewFilter[prop])));
                        } else if (prop === "EndDate") {
                            // converstions are made as the difference between utc and the server time
                            aFlaEmpty = false;
                            var oDate = new Date(oViewFilter[prop]).setDate(oViewFilter[prop].getDate() + 1);
                            aCurrentFilterValues.push(
                                new Filter("CreatedAt", FilterOperator.LT, oDate));
                        } else if (prop === "Status") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("ComplaintStatus", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "ZoneId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("Painter/ZoneId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "DvisionId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("Painter/DivisionId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "DepotId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("Painter/DepotId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "Search") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter(
                                    [
                                        new Filter({
                                            path: "Painter/Name",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "ComplaintCode",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        })
                                    ],
                                    false
                                )
                            );
                        }
                    }
                }

                var endFilter = new Filter({
                    filters: aCurrentFilterValues,
                    and: true,
                });
                if (!aFlaEmpty) {
                    return endFilter;
                } else {
                    return false;
                }
            },

            onResetFilterBar: function () {
                this._ResetFilterBar();
            },


            onListItemPress: function (oEvent) {
                var oBj = oEvent.getSource().getBindingContext().getObject();
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Detail", {
                    Id: oBj["Id"],
                    Mode: "Display"
                });

            },
            _onNavToDetails: function (mParam1) {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Detail", {
                    Id: mParam1,
                    Mode: "Display"
                });

            },
            onZoneChange: function (oEvent) {
                var sId = oEvent.getSource().getSelectedKey();
                var oView = this.getView();
                // setting value for division
                var oDivision = oView.byId("idDivision");
                oDivision.clearSelection();
                oDivision.setValue("");
                var oDivItems = oDivision.getBinding("items");
                oDivItems.filter(new Filter("Zone", FilterOperator.EQ, sId));
                //setting the data for depot;
                var oDepot = oView.byId("idDepot");
                oDepot.clearSelection();
                oDepot.setValue("");
                // clearning data for dealer
            },
            onDivisionChange: function (oEvent) {
                var sKey = oEvent.getSource().getSelectedKey();
                var oView = this.getView();
                var oDepot = oView.byId("idDepot");
                var oDepBindItems = oDepot.getBinding("items");
                oDepot.clearSelection();
                oDepot.setValue("");
                oDepBindItems.filter(new Filter("Division", FilterOperator.EQ, sKey));
            },

            onPressDelete: function (oEvent) {
                var oView = this.getView();
                var oBj = oEvent.getSource().getBindingContext().getObject();
                this._showMessageBox1("information", "Message5", [oBj["ComplaintCode"]],
                    this._DeleteComplaints.bind(this, "first paramters", "secondParameter")
                );
            },
            _DeleteComplaints: function (mParam1, mParam2) {
                // after deleting the entity make sure that we are calling the refresh just on the table and not on thw whole model
                MessageToast.show("Message5")
            },

            onEditListItemPress: function (oEvent) {
                var oBj = oEvent.getSource().getBindingContext().getObject();
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Detail",
                    {
                        Id: oBj["Id"],
                        Mode: "Edit"
                    });

            },

            onValueHelpRequestedDivison: function () {
                this._oMultiInput = this.getView().byId("multiInputDivisonAdd");
                this.oColModel = new JSONModel({
                    cols: [{
                        label: "Divison Id",
                        template: "Id",
                        width: "10rem",
                    },

                    ],
                });

                var aCols = this.oColModel.getData().cols;

                this._oValueHelpDialog = sap.ui.xmlfragment(
                    "com.knpl.dga.performancetarget.view.fragments.DivisonValueHelp",
                    this
                );
                var oDataFilter = {
                    Id: ""

                }
                var oModel = new JSONModel(oDataFilter);
                this.getView().setModel(oModel, "DivisonFilter");

                this.getView().addDependent(this._oValueHelpDialog);

                this._oValueHelpDialog.getTableAsync().then(
                    function (oTable) {
                        oTable.setModel(this.oColModel, "columns");

                        if (oTable.bindRows) {
                            oTable.bindAggregation("rows", {
                                path: "/MasterDivisions",
                                events: {
                                    dataReceived: function () {
                                        this._oValueHelpDialog.update();
                                    }.bind(this)
                                }
                            });
                        }

                        if (oTable.bindItems) {
                            oTable.bindAggregation("items", "/MasterDivisions", function () {
                                return new sap.m.ColumnListItem({
                                    cells: aCols.map(function (column) {
                                        return new sap.m.Label({
                                            text: "{" + column.template + "}",
                                        });
                                    }),
                                });
                            });
                        }

                        this._oValueHelpDialog.update();
                    }.bind(this)
                );

                this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
                this._oValueHelpDialog.open();
            },
            onFilterBarSearch: function (oEvent) {
                var afilterBar = oEvent.getParameter("selectionSet"),
                    aFilters = [];

                aFilters.push(
                    new Filter({
                        path: "Id",
                        operator: FilterOperator.Contains,
                        value1: afilterBar[0].getValue(),
                        caseSensitive: false,
                    })
                );
                // aFilters.push(
                //     new Filter({
                //         path: "Depot",
                //         operator: FilterOperator.Contains,
                //         value1: afilterBar[1].getValue(),
                //         caseSensitive: false,
                //     })
                // );

                this._filterTable(
                    new Filter({
                        filters: aFilters,
                        and: true,
                    })
                );
            },

            _filterTable: function (oFilter, sType) {
                var oValueHelpDialog = this._oValueHelpDialog;

                oValueHelpDialog.getTableAsync().then(function (oTable) {
                    if (oTable.bindRows) {
                        oTable.getBinding("rows").filter(oFilter, sType || "Application");
                    }

                    if (oTable.bindItems) {
                        oTable
                            .getBinding("items")
                            .filter(oFilter, sType || "Application");
                    }

                    oValueHelpDialog.update();
                });
            },
            onValueHelpAfterOpen: function () {
                var aFilter = this._getfilterforControl();

                this._filterTable(aFilter, "Control");
                this._oValueHelpDialog.update();
            },
            _getfilterforControl: function () {
                var sDivision = this.getView().getModel("oModelControl").getProperty("/MultiCombo/Zone");
                var aFilters = [];
                if (sDivision) {
                    for (var y of sDivision) {
                        aFilters.push(new Filter("Zone", FilterOperator.EQ, y));
                    }
                }
                if (aFilters.length == 0) {
                    return [];
                }

                return new Filter({
                    filters: aFilters,
                    and: false,
                });
            },
            onValueHelpCancelPress: function () {
                this._oValueHelpDialog.close();
            },
            onValueHelpOkPress: function (oEvent) {
                var oData = [];
                var xUnique = new Set();
                var aTokens = oEvent.getParameter("tokens");

                aTokens.forEach(function (ele) {
                    if (xUnique.has(ele.getKey()) == false) {
                        oData.push({
                            DepotId: ele.getKey()
                        });
                        xUnique.add(ele.getKey());
                    }
                });

                this.getView()
                    .getModel("oModelControl")
                    .setProperty("/MultiCombo/Divison", oData);
                this._oValueHelpDialog.close();
            },
        }
        );
    }
);