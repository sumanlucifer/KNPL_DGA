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
                        Status: "",
                        Search: "",
                        ZoneId: "",
                        DivisionId: "",
                        DepotId: "",
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
                    Status: "",
                    Search: "",
                    DGA: "",
                    preContractName: "",
                    ReassignedContractName: "",
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
                // oBindingParams.sorter.push(new Sorter("CreatedAt", true));
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
                // filter bar filters
                for (let prop in oViewFilter) {
                    if (oViewFilter[prop]) {
                        if (prop === "DGA") {
                            aFlaEmpty = true;
                            aCurrentFilterValues.push(
                                new Filter("DGA/GivenName", FilterOperator.EQ, oViewFilter[prop]));
                        }
                        else if (prop === "preContractName") {
                            aFlaEmpty = true;
                            aCurrentFilterValues.push(
                                new Filter("PreviousContractor/Name", FilterOperator.EQ, oViewFilter[prop]));
                        }
                        else if (prop === "Search") {
                            aFlaEmpty = true;
                            aCurrentFilterValues.push(
                                new Filter(
                                    [
                                        new Filter({
                                            path: "DGA/GivenName",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "PreviousContractor/Name",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "ReassignedContractor/Name",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                    ],
                                    false
                                )
                            );
                        }
                        else if (prop === "StartDate") {
                            // converstions are made as the difference between utc and the server time
                            aFlaEmpty = true;
                            aCurrentFilterValues.push(
                                new Filter("CreatedAt", FilterOperator.GE, new Date(oViewFilter[prop])));
                        } else if (prop === "EndDate") {
                            // converstions are made as the difference between utc and the server time
                            aFlaEmpty = true;
                            var oDate = oViewFilter[prop].setDate(oViewFilter[prop].getDate() + 1);
                            aCurrentFilterValues.push(
                                new Filter("CreatedAt", FilterOperator.LT, oDate));
                        }
                    }
                }
                var endFilter = new Filter({
                    filters: aCurrentFilterValues,
                    and: true,
                });
                if (aFlaEmpty) {
                    return endFilter;
                } else {
                    return false;
                }
            },
            onResetFilterBar: function () {
                this._ResetFilterBar();
            },
            onPressApproveReject: function (oEve) {
                var iId = oEve.getSource().getBindingContext().getObject().ID,
                    sButton = oEve.getSource().getTooltip().trim().toLowerCase(),
                    sStatus = sButton === "accepted" ? "2" : "rejected" ? "3": "1",
                    sAcceptedMsg = this._geti18nText("AcceptMsgConfirm"),
                    sRejectedMsg = this._geti18nText("RejectedMsgConfirm"),
                    sMessage = sButton === "accepted" ? sAcceptedMsg : "rejected" ? sRejectedMsg: 1;
                this._showMessageBox("information", sMessage, "", this.onApproveRejectServiceCall.bind(this, iId, sStatus));
            },
            onApproveRejectServiceCall: function (iId, sStatus) {
                var oPayLoad = {
                    "ReassignmentStatusId": sStatus
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