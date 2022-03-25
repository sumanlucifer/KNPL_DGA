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
            "com.knpl.dga.notificationgroups.controller.Worklist", {
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
                        DepotId: "",

                    },
                    PageBusy: true,
                    Table1Count: ""
                };
                var oMdlCtrl = new JSONModel(oDataControl);
                this.getView().setModel(oMdlCtrl, "oModelControl");
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
            onAdd: function () {
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
                if (oView.byId("table")) {
                    console.log("binding refreshed")
                    oView.byId("table").getBinding("items").refresh();
                }
                promise.resolve();
                return promise;
            },
            onBindTblComplainList: function (oEvent) {
                /*
                 * Author: manik saluja
                 * Date: 02-Dec-2021
                 * Language:  JS
                 * Purpose: init binding method for the table.
                 */
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.parameters["expand"] = "Painter,ComplaintType";
                oBindingParams.sorter.push(new Sorter("CreatedAt", true));

                // Apply Filters
                var oFilter = this._CreateFilter();
                if (oFilter) {
                    oBindingParams.filters.push(oFilter);
                }

            },
            onFilterBarSearch: function () {
                var oView = this.getView();
                this._CreateFilter();

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
                        if (prop === "StartDate") {
                            // converstions are made as the difference between utc and the server time
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("CreatedAt", FilterOperator.GE, new Date(oViewFilter[prop])));
                        } else if (prop === "EndDate") {
                            // converstions are made as the difference between utc and the server time
                            aFlaEmpty = false;
                            var oDate = oViewFilter[prop].setDate(oViewFilter[prop].getDate() + 1);
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
                                            path: "GroupName",
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
                //table1
                var oTable = this.getView().byId("table");
                var oBinding = oTable.getBinding("items");
                if (!aFlaEmpty && oBinding) {
                    oBinding.filter(endFilter);
                } else {
                    oBinding.filter([]);
                }
            },

            onResetFilterBar: function () {
                this._ResetFilterBar();
            },
            onUpdateFinished: function (oEvent) {
                var sTitle, sDraft,
                    oTable = this.getView().byId("table"),
                    iTotalItems = oEvent.getParameter("total");
                // sDraft = this.getResourceBundle().getText("draftCount", [iTotalItems]);
                // this.getModel("worklistView").setProperty("/draft", sDraft);

                if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                    sDraft = this.getResourceBundle().getText("Table1Count", [
                        iTotalItems,
                    ]);
                } else {
                    sDraft = this.getResourceBundle().getText("draftCount", [0]);
                }
                this.getModel("oModelControl").setProperty("/Table1Count", sDraft);


            },
            onDelete: function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext();
                var oObj = oContext.getObject();
                var sPath = oContext.getPath() + "/IsArchived";
                var that = this;
                this._showMessageBox1("warning", "Message5", [oObj["GroupName"]], this._onConfirmDelete.bind(this, sPath));
            },
            _onConfirmDelete: function (mParam1) {
                // mParam1 is the sPath.
                var oView = this.getView();
                var oModel = oView.getModel();
                var othat = this;
                var oPayLoad = {
                    IsArchived: true
                }
                oModel.update(mParam1, oPayLoad,
                    {
                        success: function () {
                            othat._showMessageToast("Message7");
                            othat.getView().byId("table").getBinding("items").refresh();
                        }, error: function (oEvent) {
                            othat._showMessageBox2("error", "Message8")
                        }
                    })
            },
            onPressView: function (oEvent) {
                var oBj = oEvent.getSource().getBindingContext().getObject();
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Detail", {
                    Id: oBj["Id"],
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
                oRouter.navTo("Detail", {
                    Id: oBj["Id"],
                    Mode: "Edit"
                });

            }
        }
        );
    }
);