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
            "com.knpl.dga.ui5template.controller.Worklist", {
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
                        ReassignmentStatus: "",
                        Search: "",
                        ZoneId: "",
                        DivisionId: "",
                        DepotId: ""
                    },
                    PageBusy: false
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
                    EndDate: null,
                    ReassignmentStatus: "",
                    Search: "",
                    Zone: "",
                    ZoneId: "",
                    DivisionId: "",
                    DepotId: ""
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
                // oModelControl.setProperty("/PageBusy", true)
                c1 = othat._addSearchFieldAssociationToFB();
                // c1.then(function () {
                //     c2 = othat._dummyPromise();
                //     c2.then(function () {
                //         c3 = othat._initTableData();
                //         c3.then(function () {
                //             oModelControl.setProperty("/PageBusy", false)
                //         })
                //     })
                // })
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
                // var oDepot = oView.byId("idDepot");
                // oDepot.clearSelection();
                // oDepot.setValue("");
                // clearning data for dealer
                // oModelContorl.setProperty("/MultiCombo/Dealers", []);
            },
            // onDivisionChange: function (oEvent) {
            //     var sKey = oEvent.getSource().getSelectedKey();
            //     var oView = this.getView();
            //     var oModelContorl = oView.getModel("oModelControl");
            //     var oDepot = oView.byId("idDepot");
            //     var oDepBindItems = oDepot.getBinding("items");
            //     oDepot.clearSelection();
            //     oDepot.setValue("");
            //     oDepBindItems.filter(new Filter("Division", FilterOperator.EQ, sKey));
            //     // clearning data for dealer
            //     // oModelContorl.setProperty("/MultiCombo/Dealers", []);
            // },
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
                if (oView.byId("idWorkListTable1")) {
                    oView.byId("idWorkListTable1").rebindTable();
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
                oBindingParams.parameters["expand"] = "Lead,DGA,PreviousContractor,ReassignedContractor,ReassignmentStatus";
                oBindingParams.sorter.push(new Sorter("CreatedAt", true));
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
                            var oDate = new Date(oViewFilter[prop]).setDate(oViewFilter[prop].getDate() + 1);
                            aCurrentFilterValues.push(
                                new Filter("CreatedAt", FilterOperator.LT, oDate));
                        } else if (prop === "ReassignmentStatus") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("ReassignmentStatus/Name", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "ZoneId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("DGA/Zone", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "DivisionId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("DGA/DivisionId", FilterOperator.EQ, oViewFilter[prop]));
                        }  else if (prop === "Search") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter(
                                    [
                                        new Filter({
                                            path: "DGA/Zone",
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
                                            path: "Lead/ConsumerName",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "ReassignmentStatus/Name",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "DGA/DivisionId",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "Remark",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "Lead/PrimaryNum",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        })
                                        // new Filter({
                                        //     path: "Lead/Id",
                                        //     operator: "EQ",
                                        //     value1: oViewFilter[prop].trim(),
                                        //     caseSensitive: false
                                        // })
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
            // _CreateFilter: function () {
            //     var aCurrentFilterValues = [];
            //     var oViewFilter = this.getView()
            //         .getModel("oModelControl")
            //         .getProperty("/filterBar");
            //     var aFlaEmpty = false;
            //     aCurrentFilterValues.push(
            //         new Filter("IsArchived", FilterOperator.EQ, false));
            //     // filter bar filters
            //     for (let prop in oViewFilter) {
            //         if (oViewFilter[prop]) {
            //             if (prop === "ZoneId") {
            //                 aFlaEmpty = false;
            //                 aCurrentFilterValues.push(
            //                     new Filter("DGA/Zone", FilterOperator.EQ, oViewFilter[prop]));
            //             } else if (prop === "DivisionId") {
            //                 aFlaEmpty = false;
            //                 aCurrentFilterValues.push(
            //                     new Filter("DGA/DivisionId", FilterOperator.EQ, oViewFilter[prop]));
            //             } else if (prop === "ReassignmentStatus") {
            //                 aFlaEmpty = false;
            //                 aCurrentFilterValues.push(
            //                     new Filter("ReassignmentStatus/Name", FilterOperator.EQ, oViewFilter[prop]));
            //             } else if (prop === "Search") {
            //                 aFlaEmpty = false;
            //                 aCurrentFilterValues.push(
            //                     new Filter(
            //                         [
            //                             new Filter({
            //                                 path: "DGA/Zone",
            //                                 operator: "Contains",
            //                                 value1: oViewFilter[prop].trim(),
            //                                 caseSensitive: false
            //                             }),
            //                             new Filter({
            //                                 path: "DGA/GivenName",
            //                                 operator: "Contains",
            //                                 value1: oViewFilter[prop].trim(),
            //                                 caseSensitive: false
            //                             }),
            //                             new Filter({
            //                                 path: "Lead/ConsumerName",
            //                                 operator: "Contains",
            //                                 value1: oViewFilter[prop].trim(),
            //                                 caseSensitive: false
            //                             }),
            //                             new Filter({
            //                                 path: "ReassignmentStatus/Name",
            //                                 operator: "Contains",
            //                                 value1: oViewFilter[prop].trim(),
            //                                 caseSensitive: false
            //                             }),
            //                             new Filter({
            //                                 path: "DGA/DivisionId",
            //                                 operator: "Contains",
            //                                 value1: oViewFilter[prop].trim(),
            //                                 caseSensitive: false
            //                             }),
            //                             new Filter({
            //                                 path: "Remark",
            //                                 operator: "Contains",
            //                                 value1: oViewFilter[prop].trim(),
            //                                 caseSensitive: false
            //                             }),
            //                             new Filter({
            //                                 path: "Lead/PrimaryNum",
            //                                 operator: "Contains",
            //                                 value1: oViewFilter[prop].trim(),
            //                                 caseSensitive: false
            //                             }),
            //                             new Filter({
            //                                 path: "Lead/Id",
            //                                 operator: "EQ",
            //                                 value1: oViewFilter[prop].trim(),
            //                                 caseSensitive: false
            //                             })
            //                         ],
            //                         false
            //                     )
            //                 );
            //             }
            //             else if (prop === "StartDate") {
            //                 // converstions are made as the difference between utc and the server time
            //                 aFlaEmpty = false;
            //                 aCurrentFilterValues.push(
            //                     new Filter("CreatedAt", FilterOperator.GE, new Date(oViewFilter[prop])));
            //             } else if (prop === "EndDate") {
            //                 // converstions are made as the difference between utc and the server time
            //                 aFlaEmpty = false;
            //                 var oDate = oViewFilter[prop].setDate(oViewFilter[prop].getDate() + 1);
            //                 aCurrentFilterValues.push(
            //                     new Filter("CreatedAt", FilterOperator.LT, oDate));
            //             }
            //         }
            //     }
            //     var endFilter = new Filter({
            //         filters: aCurrentFilterValues,
            //         and: true,
            //     });
            //     if (aFlaEmpty) {
            //         return endFilter;
            //     } else {
            //         return false;
            //     }
            // },
            onResetFilterBar: function () {
                this._ResetFilterBar();
            },
            onPressApproveReject: function (oEve) {
                var iId = oEve.getSource().getBindingContext().getObject().ID,
                    sButton = oEve.getSource().getTooltip().trim().toLowerCase(),
                    sStatus = sButton === "accepted" ? "2" : "rejected" ? "3" : "1",
                    sMessage = sButton === "accepted" ? "Approve" : "Reject",
                    sAccptRejctCheck = sButton === "accepted" ? this._showMessageBox("information", "MsgConfirm", [sMessage], this.onApproveRejectServiceCall.bind(this, iId, sStatus)) : this._showMessageBox("remark", "MsgConfirm", [sMessage], "", "", iId, sStatus);
                // this._showMessageBox("information", "MsgConfirm", [sMessage], this.onApproveRejectServiceCall.bind(this, iId, sStatus));
            },
            onListItemPress: function (oEvent) {
                var oRouter = this.getOwnerComponent().getRouter();
                var oObject = oEvent.getSource().getBindingContext().getObject();
                var sPath = oEvent
                    .getSource()
                    .getBindingContext()
                    .getPath()
                    .substr(1);
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Detail", {
                    Id: oObject["ID"],
                });
            },
            onApproveRejectServiceCall: function (iId, sStatus, Note) {
                var oPayLoad = {
                    "ReassignmentStatusId": sStatus,
                    "Remark": Note
                };
                var oDataModel = this.getView().getModel();
                oDataModel.update(`/ContractorReassignmentRequests(${iId})/ReassignmentStatusId`, oPayLoad, {
                    success: function (data) {
                        var oTable = this.getView().byId("idWorkListTable1");
                        oTable.rebindTable();
                    }.bind(this),
                    error: function (data) {
                    }.bind(this),
                });
            },
        }
        );
    }
);