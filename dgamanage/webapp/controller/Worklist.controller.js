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
            "com.knpl.dga.dgamanage.controller.Worklist", {
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
                        ZoneId: "",
                        DivisionId: "",
                        DepotId: "",
                        StartDate: null,
                        EndDate: null,
                        Status: "",
                        Search: "",
                        DGAType: "",
                        PinCodeId: "",
                        PayrollCompanyId: ""
                    },
                    FilterAddFileds: {
                        PinCode: ""
                    },
                    PageBusy: true,
                    resourcePath: "com.knpl.dga.dgamanage"
                };
                var oMdlCtrl = new JSONModel(oDataControl);
                this.getView().setModel(oMdlCtrl, "oModelControl");
                oRouter
                    .getRoute("worklist")
                    .attachMatched(this._onRouteMatched, this);
                var startupParams;
                if (this.getOwnerComponent().getComponentData()) {
                    startupParams = this.getOwnerComponent().getComponentData().startupParameters;
                }
                // console.log(startupParams);
                if (startupParams) {
                    if (startupParams.hasOwnProperty("DgaId")) {
                        if (startupParams["DgaId"].length > 0) {
                            this._onNavToDetails(startupParams["DgaId"][0]);
                        }
                    }
                }


            },
            _onRouteMatched: function () {
                this._InitData();
            },
            _ResetFilterBar: function () {
                var aCurrentFilterValues = [];
                var aResetProp = {
                    ZoneId: "",
                    DivisionId: "",
                    DepotId: "",
                    StartDate: null,
                    EndDate: null,
                    Status: "",
                    Search: "",
                    DGAType: "",
                    PinCodeId: "",
                    PayrollCompanyId: ""
                };
                var aFiterAddFileds = {
                    PinCode: ""
                };
                var oViewModel = this.getView().getModel("oModelControl");
                oViewModel.setProperty("/filterBar", aResetProp);
                oViewModel.setProperty("/FilterAddFileds", aFiterAddFileds);
                var oTable = this.getView().byId("idWorkListTable1");
                oTable.rebindTable();

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
                    //c2 = othat._getLoggedInInfo();
                    c2 = othat._dummyFunction();
                    c2.then(function () {
                        c3 = othat._initTableData();
                        c3.then(function () {
                            oModelControl.setProperty("/PageBusy", false)
                        })
                    })
                })

            },
            _dummyFunction: function (oPayLoad) {
                var promise = $.Deferred();
                promise.resolve(oPayLoad);
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
                var oTable = oView.byId("idWorkListTable1");
                if (oTable) {
                    oTable.rebindTable();
                }
                //oView.byId("idWorkListTable1").rebindTable();
                promise.resolve();
                return promise;
            },
            sampleFunction:function(mParam1){
                console.log(mParam1)
            },
            onBindTblComplainList: function (oEvent) {

                /*
                 * Author: manik saluja
                 * Date: 02-Dec-2021
                 * Language:  JS
                 * Purpose: init binding method for the table.
                 */
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.parameters["expand"] = "DGAType,Division,Pincode,Positions,PayrollCompany";
                oBindingParams.sorter.push(new Sorter("CreatedAt", true));

                // Apply Filters
                var oFilter = this._CreateFilter();
                if (oFilter) {
                    oBindingParams.filters.push(oFilter);
                }

            },
            onFilterBarGo: function () {
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
                        } else if (prop === "Status") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("ActivationStatus", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "ZoneId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("Zone", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "DivisionId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("DivisionId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "DepotId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("Positions/DepotId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "DGAType") {

                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("DGATypeId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "PayrollCompanyId") {

                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("PayrollCompanyId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "PinCodeId") {

                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("PincodeId", FilterOperator.EQ, oViewFilter[prop]));
                        } else if (prop === "Search") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter(
                                    [
                                        new Filter({
                                            path: "GivenName",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "Mobile",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "DGAType/Name",
                                            operator: "Contains",
                                            value1: oViewFilter[prop].trim(),
                                            caseSensitive: false
                                        }),
                                        new Filter({
                                            path: "UniqueId",
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
            onZoneChange: function (oEvent) {
                var sId = oEvent.getSource().getSelectedKey();
                var oView = this.getView();
                var oModelContorl = oView.getModel("oModelControl");
                var oModelView = oView.getModel("oModelView");
                // setting value for division
                var oDivision = oView.byId("idDivision");
                oDivision.clearSelection();
                oDivision.setValue("");
                var oDivItems = oDivision.getBinding("items");
                oDivItems.filter(new Filter("Zone", FilterOperator.EQ, sId));
            },
            onDivisionChange: function (oEvent) {
                var sKey = oEvent.getSource().getSelectedKey();
                var oView = this.getView();
                var oModelContorl = oView.getModel("oModelControl");
                var oModelView = oView.getModel("oModelView");
                var oDepot = oView.byId("idDepot");
                var oDepBindItems = oDepot.getBinding("items");
                oDepot.clearSelection();
                oDepot.setValue("");
                oDepBindItems.filter(new Filter("Division", FilterOperator.EQ, sKey));
                // clearning data for dealer
            },
            _handlePinCodeValueHelpConfirm: function (oEvent) {

                var oSelectedItem = oEvent.getParameter("selectedItem");
                var oModelControl = this.getView().getModel("oModelControl");
                var obj = oSelectedItem.getBindingContext().getObject();
                oModelControl.setProperty(
                    "/FilterAddFileds/PinCode",
                    obj["Name"]
                );
                oModelControl.setProperty(
                    "/filterBar/PinCodeId",
                    obj["Id"]
                );

                this._onDialogClose();

            },

            onListItemPress: function (oEvent) {
                var oBj = oEvent.getSource().getBindingContext().getObject();
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Detail", {
                    Id: oBj["Id"],
                    Mode: "Display"
                });

            },
            _onNavToDetails:function(mParam1){
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Detail", {
                    Id: mParam1,
                    Mode: "Display"
                });
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