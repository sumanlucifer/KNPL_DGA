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
            "com.knpl.dga.featureaccess.controller.Worklist", {
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
                    Status: "",
                    Search: "",
                    ZoneId: "",
                    DivisionId: "",
                    DepotId: "",
                };
                var oViewModel = this.getView().getModel("oModelControl");
                oViewModel.setProperty("/filterBar", aResetProp);
                var oTable = this.getView().byId("idWorkListTable");
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
                // c1 = othat._addSearchFieldAssociationToFB();
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
                if (oView.byId("idWorkListTable")) {
                    oView.byId("idWorkListTable").rebindTable();
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
                oBindingParams.parameters["expand"] = "AppFeature";
                oBindingParams.filters.push(new Filter("DGATypeId", sap.ui.model.FilterOperator.EQ, "1"));
                // oBindingParams.sorter.push(new Sorter("CreatedAt", true));
                // Apply Filters
                // var oFilter = this._CreateFilter();
                // if (oFilter) {
                //     oBindingParams.filters.push(oFilter);
                // }
            },
            onsharedDGAFeature: function (oEvent) {
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.parameters["expand"] = "AppFeature";
                oBindingParams.filters.push(new Filter("DGATypeId", sap.ui.model.FilterOperator.EQ, "2"));
            },
            onFilterBarSearch: function () {
                var oView = this.getView();
                oView.byId("idWorkListTable").rebindTable();
            },
            _CreateFilter: function () {
                var aCurrentFilterValues = [];
                var oViewFilter = this.getView()
                    .getModel("oModelControl")
                    .getProperty("/filterBar");
                var aFlaEmpty = false;
                // init filters - is archived and complaint type id is 1
                aCurrentFilterValues.push(
                    new Filter("IsArchived", FilterOperator.EQ, false));
                aCurrentFilterValues.push(
                    new Filter("ComplaintTypeId", FilterOperator.NE, 1));
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
            onChange: function (oEve) {
                var iDGATypeId = oEve.getSource().getBindingContext().getObject().DGATypeId;
                var iFeatureId = oEve.getSource().getBindingContext().getObject().FeatureId;
                var iId = oEve.getSource().getBindingContext().getObject().Id,
                    sButton = oEve.getSource(),
                    sButtonState = oEve.getSource().getState(),
                    sStatus = sButtonState === true ? true : false,
                    sMessage = sButtonState === true ? "Activate" : "Deactivate";
                this._showMessageBox("information", "MsgConfirm", [sMessage], this.onActivateDeactivateServiceCall.bind(this, iId, sStatus, iDGATypeId, iFeatureId), this.onPressNo.bind(this, sButton));
            },
            onActivateDeactivateServiceCall: function (iId, sStatus, iDGATypeId, iFeatureId) {
                var oPayLoad = {
                    "Id": iId,
                    "DGATypeId": iDGATypeId,
                    "FeatureId": iFeatureId,
                    "IsActive": sStatus
                };
                var oDataModel = this.getView().getModel();
                oDataModel.update(`/MapFeaturePermission(${iId})`, oPayLoad, {
                    success: function (data) {
                        var oTable = this.getView().byId("idWorkListTable");
                        oTable.rebindTable();
                        var oTable = this.getView().byId("idsharedTable");
                        oTable.rebindTable();
                    }.bind(this),
                    error: function (data) {
                    }.bind(this),
                });
            },
            onPressNo: function (oSwitch) {
                var bState = oSwitch.getState() === true ? false : true;
                oSwitch.setState(bState);
            }
        });
    }
);