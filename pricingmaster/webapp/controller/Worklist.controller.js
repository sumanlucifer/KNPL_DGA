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
            "com.knpl.dga.pricingmaster.controller.Worklist", {
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
                        Status: "",
                        Search: "",
                        ZoneId: "",
                        DivisionId: "",
                        Depot: "",
                        CategoryId: "",
                        ClassId: "",
                        ProductId: "",
                        PaintTypeId: "",
                        PlanId: "",


                    },

                    AddFields: {
                        Depot: ""
                    },
                    PageBusy: true
                };
                var oMdlCtrl = new JSONModel(oDataControl);
                this.getView().setModel(oMdlCtrl, "oModelControl");
                var startupParams;
                if (this.getOwnerComponent().getComponentData()) {
                    startupParams = this.getOwnerComponent().getComponentData().startupParameters;
                }
                // console.log(startupParams);
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
                oRouter.navTo("Add");

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
                c1 = othat._addSearchFieldAssociationToFB();
                c1.then(function () {
                    c2 = othat._dummyPromise();
                    c2.then(function () {
                        c3 = othat._initTableData();
                        c3.then(function () {
                            oModelControl.setProperty("/PageBusy", false)
                        })
                    })
                })

            },

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
                 * Author: manik saluja
                 * Date: 02-Dec-2021
                 * Language:  JS
                 * Purpose: Used to load the table data and trigger the on before binding method.
                 */
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                // if (oView.byId("idWorkListTable1")) {

                oView.byId("idWorkListTable1").rebindTable();
                // }
                promise.resolve();
                return promise;
            },
            onBindTblPriceList: function (oEvent) {
                /*
                 * Author: Mamta Singh
                 * Date: 28-may-2022
                 * Language:  JS
                 * Purpose: init binding method for the table.
                 */
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.parameters["expand"] = "ProductCategory,Class,Product,PaintType,System,Plan,ValueAddition";
                // oBindingParams.sorter.push(new Sorter("ProductCategory/Name", true));

                //    Apply Filters
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

                var aFlaEmpty = true;


                // filter bar filters
                for (let prop in oViewFilter) {
                    if (oViewFilter[prop]) {
                        if (prop === "ZoneId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("Id", FilterOperator.EQ, oViewFilter[prop]));
                        }
                        if (prop === "DivisionId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("Id", FilterOperator.EQ, oViewFilter[prop]));


                        }
                        if (prop === "Depot") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("DepotCode", FilterOperator.EQ, oViewFilter[prop]));

                        }
                        else if (prop === "CategoryId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("ProductCategoryId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "ClassId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("ClassId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "ProductId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("ProductId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "PaintTypeId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("PaintTypeId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "PlanId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("PlanId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "Search") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter(
                                    [
                                        new Filter({
                                            path: "ValueAddition/Name",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "Putty",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "Primer",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "System/Name",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
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

            _ResetFilterBar: function () {
                var aCurrentFilterValues = [];
                var aResetProp = {
                    StartDate: null,
                    Search: "",
                    ZoneId: "",
                    DivisionId: "",
                    Depot: "",
                    CategoryId: "",
                    ClassId: "",
                    ProductId: "",
                    PaintTypeId: "",
                    PlanId: ""
                };

                // var aFilterAddFields = {
                //     Depot: ""
                // };

                var oViewModel = this.getView().getModel("oModelControl");
                oViewModel.setProperty("/filterBar", aResetProp);
                var oTable = this.getView().byId("idWorkListTable1");
                oTable.rebindTable();

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
                var oModelContorl = oView.getModel("oModelControl")
                // setting value for division
                var oDivision = oView.byId("idDivision");
                oDivision.clearSelection();
                oDivision.setValue("");
                var oDivItems = oDivision.getBinding("items");
                oDivItems.filter(new Filter("Zone", FilterOperator.EQ, sId));
                //setting the data for depot;
                var oDepot = oView.byId("idDepot");
                // oDepot.clearSelection();
                oDepot.setValue("");

            },
            onDivisionChange: function (oEvent) {
                var sKey = oEvent.getSource().getSelectedKey();
                var oView = this.getView();
                this.sDivisionKey = sKey
                var oDepot = oView.byId("idDepot");

                oDepot.setValue("");

            },

            // onPressDelete: function (oEvent) {
            //     var oView = this.getView();
            //     var oBj = oEvent.getSource().getBindingContext().getObject();
            //     this._showMessageBox1("information", "Message5", [oBj["ComplaintCode"]],
            //         this._DeleteComplaints.bind(this, "first paramters", "secondParameter")
            //     );
            // },
            // _DeleteComplaints: function (mParam1, mParam2) {
            //     // after deleting the entity make sure that we are calling the refresh just on the table and not on thw whole model
            //     MessageToast.show("Message5")
            // },

            onEditListItemPress: function (oEvent) {
                var oBj = oEvent.getSource().getBindingContext().getObject();
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Detail", {
                    Id: oBj["Id"],
                    Mode: "Edit"
                });

            }
        }
        );
    }
);