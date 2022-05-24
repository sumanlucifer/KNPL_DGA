

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
            "com.knpl.dga.controller.Worklist", {
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
                        StartDate: new Date(),
                        EndDate: new Date(),
                        DGAId: null
                    },
                    AddFields: {
                    },
                    PageBusy: true,
                    resourcePath: "com.knpl.dga.insights."
                };
                var oMdlCtrl = new JSONModel(oDataControl);
                this.getView().setModel(oMdlCtrl, "oModelControl");
                oRouter
                    .getRoute("worklist")
                    .attachMatched(this._onRouteMatched, this);
            },
            _onRouteMatched: function () {
                this._InitData();
            },
            // onPressAddObject: function () {
            //     /*
            //      * Author: manik saluja
            //      * Date: 02-Dec-2021
            //      * Language:  JS
            //      * Purpose: Navigation to add object view and controller
            //      */
            //     var oRouter = this.getOwnerComponent().getRouter();
            //     oRouter.navTo("Add");

            // },
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
                this.getView().byId("tdy").setType("Emphasized");
                var oModelControl = oView.getModel("oModelControl");
                var c1, c2, c3, c4;
                oModelControl.setProperty("/PageBusy", true)
                c1 = othat._dummyFunction();
                c1.then(function () {
                    c2 = othat._dummyFunction();
                    c2.then(function () {
                        c3 = othat._dummyFunction();
                        c3.then(function () {
                            oModelControl.setProperty("/PageBusy", false)
                        })
                    })
                })

            },
            _dummyFunction: function () {
                var promise = jQuery.Deferred();
                promise.resolve()
                return promise;
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
                        search: othat.onFilterBarGo.bind(othat)
                    });
                    oFilterBar.setBasicSearch(oBasicSearch);
                }
                promise.resolve();
                return promise;

            },
            rebindLeadByStatusTbl: function (oEvent) {
                var oView = this.getView();
                var oDateFormat = sap.ui.core.format.DateFormat.getInstance({ pattern: "yyyy-MM-dd" });
                var oMdlCtrl = oView.getModel("oModelControl");
                var dStartDate = oDateFormat.format(oMdlCtrl.getProperty("/filterBar/StartDate"));
                var dEndDate = oDateFormat.format(oMdlCtrl.getProperty("/filterBar/EndDate"));
                var oCustom = {
                    StartDate: "" + dStartDate + "",
                    EndDate: "" + dEndDate + "",
                    DGAId: "0"
                };
                var oBindingParams = oEvent.getParameter("bindingParams");
                // oBindingParams.sorter.push(new sap.ui.model.Sorter('LEAD_STATUS_ID', true));
                if (oCustom) {
                    oBindingParams.parameters.custom = oCustom;
                }
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
                oView.byId("idWorkListTable1").rebindTable();
                promise.resolve();
                return promise;
            },

            onFilterBarGo: function (oEvent, bSkipButtonTypeReset) {
                var oView = this.getView();
                if(!bSkipButtonTypeReset){
                    this.getView().byId("mtd").setType("Default");
                    this.getView().byId("tdy").setType("Default");
                    this.getView().byId("ytd").setType("Default");
                }
                oView.byId("idLeadByStatus").rebindTable();
                oView.byId("idLeadBySource").rebindTable();
                oView.byId("idBusinessGenValByCategory").rebindTable();
                oView.byId("idBusinessGenVolByCategory").rebindTable();
                oView.byId("idBusinessGenValByClassification").rebindTable();
                oView.byId("idBusinessGenVolByClassification").rebindTable();
                // this.getView().byId("mtd").setType("Default");
                // this.getView().byId("tdy").setType("Default");
                // this.getView().byId("ytd").setType("Default");
            },
            _CreateFilter: function () {
                var aCurrentFilterValues = [];
                var oViewFilter = this.getView()
                    .getModel("oModelControl")
                    .getProperty("/filterBar");

                var aFlaEmpty = false;
                // init filters - is archived 
                aCurrentFilterValues.push(
                    new Filter("IsArchived", FilterOperator.EQ, false));

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
                                new Filter("Zone", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "DivisionId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("DivisionId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "Pincode") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("Pincode", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "DepotId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("DepotId", FilterOperator.EQ, oViewFilter[prop]));
                            // } else if (prop === "DGAType") {
                            //     aFlaEmpty = false;
                            //     aCurrentFilterValues.push(
                            //         new Filter("DGATypeId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "Search") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter(
                                    [
                                        new Filter({
                                            path: "ConsumerName",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "DGA/GivenName",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "DGA/FamilyName",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "DGA/UniqueId",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "PrimaryNum",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "LeadServiceType/Name",
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
                var oView = this.getView();
                this.getView().byId("mtd").setType("Default");
                this.getView().byId("tdy").setType("Emphasized");
                this.getView().byId("ytd").setType("Default");
                this._ResetFilterBar();
            },

            _ResetFilterBar: function () {
                var aCurrentFilterValues = [];
                var aResetProp = {
                    StartDate: new Date(),
                    EndDate: new Date(),
                    DGAId: null
                };

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
            _handlePinCodeValueHelpConfirm: function (oEvent) {

                var oSelectedItem = oEvent.getParameter("selectedItem");
                var oModelControl = this.getView().getModel("oModelControl");
                var obj = oSelectedItem.getBindingContext().getObject();
                oModelControl.setProperty(
                    "/AddFields/Pincode",
                    obj["Name"]
                );
                oModelControl.setProperty(
                    "/filterBar/Pincode",
                    obj["Name"]
                );
                this._onDialogClose();
            },

            onPressTodayFilter: function (oEvent) {
                //var oView = this.getView();
                var oView = this.getView().byId("tdy").setType("Emphasized");
                var oView = this.getView().byId("mtd").setType("Default");
                var oView = this.getView().byId("ytd").setType("Default");

                var oDateFormat = sap.ui.core.format.DateFormat.getInstance({ pattern: "yyyy-MM-dd" });
                var dEndDate = new Date();
                var dStartDate = new Date();
                var oMdlCtrl = oView.getModel("oModelControl");
                var dStartDate = oMdlCtrl.setProperty("/filterBar/StartDate", dStartDate);
                var dStartDate = oMdlCtrl.setProperty("/filterBar/EndDate", dEndDate);
                this.onFilterBarGo(oEvent, true);
            },

            onPressMTDFilter: function (oEvent) {
                var oView = this.getView();
                this.getView().byId("mtd").setType("Emphasized");
                this.getView().byId("tdy").setType("Default");
                this.getView().byId("ytd").setType("Default");
                var dEndDate = new Date();
                var dStartDate = new Date(dEndDate.getFullYear(), dEndDate.getMonth(), 1);
                var oMdlCtrl = oView.getModel("oModelControl");
                var dStartDate = oMdlCtrl.setProperty("/filterBar/StartDate", dStartDate);
                var dStartDate = oMdlCtrl.setProperty("/filterBar/EndDate", dEndDate);
                this.onFilterBarGo(oEvent, true);
            },

            onPressYTDFilter: function (oEvent) {
                var oView = this.getView();
                this.getView().byId("ytd").setType("Emphasized");
                this.getView().byId("tdy").setType("Default");
                this.getView().byId("mtd").setType("Default");
                var dEndDate = new Date();
                var iCurrentMonth = dEndDate.getMonth();
                if (iCurrentMonth < 3)
                    var dStartDate = new Date(dEndDate.getFullYear() - 1, 3, 1);
                else
                    dStartDate = new Date(dEndDate.getFullYear(), 3, 1);
                var oMdlCtrl = oView.getModel("oModelControl");
                var dStartDate = oMdlCtrl.setProperty("/filterBar/StartDate", dStartDate);
                var dStartDate = oMdlCtrl.setProperty("/filterBar/EndDate", dEndDate);
                this.onFilterBarGo(oEvent, true);
            }

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

            // onEditListItemPress: function (oEvent) {
            //     var oBj = oEvent.getSource().getBindingContext().getObject();
            //     var oRouter = this.getOwnerComponent().getRouter();
            //     oRouter.navTo("Detail", {
            //         Id: oBj["Id"],
            //         Mode: "Edit"
            //     });

            // }
        }
        );
    }
);