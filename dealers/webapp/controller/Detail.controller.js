sap.ui.define(
    [
        "../controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/core/Fragment",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/Sorter",
        "../controller/Validator",
        "sap/ui/core/ValueState",
        "../model/formatter",
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (
        BaseController,
        JSONModel,
        MessageBox,
        MessageToast,
        Fragment,
        Filter,
        FilterOperator,
        Sorter,
        Validator,
        ValueState,
        formatter
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.dga.dealers.controller.Detail", {
            formatter: formatter,

            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("Detail").attachMatched(this._onRouteMatched, this);
            },
            _onRouteMatched: function (oEvent) {
                var sId = window.decodeURIComponent(
                    oEvent.getParameter("arguments").Id
                );
                var sMode = window.decodeURIComponent(
                    oEvent.getParameter("arguments").Mode
                );
                this._SetDisplayData(sId, sMode);

            },

            _SetDisplayData: function (oProp, sMode) {
                var oData = {
                    mode: sMode,
                    bindProp: "MasterDealers('" + oProp + "')",
                    Id: oProp,
                    EntitySet: "MasterDealers",
                    PageBusy: true,
                    IcnTabKey: "0",
                    resourcePath: "com.knpl.dga.dealers",

                };
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "oModelDisplay");
                if (sMode == "Edit") {
                    this._DummyPromise();
                } else {
                    this._initDisplayData();
                }

            },
            _initDisplayData: function () {
                var c1, c2, c3;
                var oModel = this.getView().getModel("oModelDisplay");
                var oData = oModel.getData();
                var othat = this;
                oModel.setProperty("/PageBusy", true);
                c1 = othat._DummyPromise();
                c1.then(function () {
                    c2 = othat._getDisplayData(oData["bindProp"]);
                    c2.then(function () {
                        c3 = othat._LoadFragment("BasicDetails");
                        c3.then(function () {
                            oModel.setProperty("/PageBusy", false)
                        })
                    })
                })
            },

            _DummyPromise: function () {
                var promise = $.Deferred();
                // this method will be used for setting up additonal flags and filter
                promise.resolve();
                return promise;
            },

            _getDisplayData: function (oProp) {
                var promise = jQuery.Deferred();
                var oView = this.getView();

                var exPand = "DealerSalesDetails/SalesGroup,DealerPhoneNumber";
                var othat = this;
                if (oProp.trim() !== "") {
                    oView.bindElement({
                        path: "/" + oProp,
                        parameters: {
                            expand: exPand,
                        },
                        events: {
                            dataRequested: function (oEvent) {
                                //  oView.setBusy(true);
                            },
                            dataReceived: function (oEvent) {
                                //  oView.setBusy(false);
                            },
                        },
                    });
                }
                promise.resolve();
                return promise;
            },

            onIcnTbarChange: function (oEvent) {
                var sKey = oEvent.getSource().getSelectedKey();
                var oView = this.getView();
                if (sKey == "1") {
                    oView.byId("DGATable").rebindTable();
                }
                else if (sKey == "2") {
                    oView.byId("ContractorTable").setModel(oView.getModel("PragatiModel"));
                    oView.byId("ContractorTable").rebindTable();
                }
            },

            onBeforeRebindDGATable: function (oEvent) {
                var oView = this.getView();
                var sId = oView.getModel("oModelDisplay").getProperty("/Id")
                var mBindingParams = oEvent.getParameter("bindingParams");
                mBindingParams.parameters["expand"] = "DGA,DGA/DGAType,DGA/Depot,DGA/Pincode,DGA/PayrollCompany";
                var oDealerIdFilter = new Filter("DealerId", FilterOperator.EQ, sId );
                mBindingParams.filters.push(oDealerIdFilter);
            },

            onBeforeRebindContractorTable: function (oEvent) {
                var oView = this.getView();
                var sId = oView.getModel("oModelDisplay").getProperty("/Id")
                var mBindingParams = oEvent.getParameter("bindingParams");
                mBindingParams.parameters["expand"] = "Slab,AgeGroup,Preference/Language,PainterBankDetails,PrimaryDealerDetails,PainterKycDetails,PainterType";
                mBindingParams.sorter.push(new Sorter("CreatedAt", true));
                var oDealerIdFilter = new Filter("DealerId", FilterOperator.EQ, sId );
                var oArchivedFilter = new Filter("IsArchived", FilterOperator.EQ, false);
                mBindingParams.filters.push(oDealerIdFilter,oArchivedFilter);
            },

            _LoadFragment: function (mParam) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                var oVboxProfile = oView.byId("oVBoxAddObjectPage");
                var sResourcePath = oView.getModel("oModelDisplay").getProperty("/resourcePath")
                oVboxProfile.destroyItems();
                return Fragment.load({
                    id: oView.getId(),
                    controller: othat,
                    name: sResourcePath + ".view.fragments." + mParam,
                }).then(function (oControlProfile) {
                    oView.addDependent(oControlProfile);
                    oVboxProfile.addItem(oControlProfile);
                    promise.resolve();
                    return promise;
                });
            },
            
            onListItemPressContractors: function (oEvent) {
                var oBj = oEvent.getSource().getBindingContext().getObject();
                this.Navigate({
                    target: {
                        semanticObject: "PricingMaster",
                        action: "Manage",
                        params: {
                            PainterId: oBj["Id"]
                        }
                    }
                });
            },
            
            onListItemPressDGA: function (oEvent) { 
                var oBj = oEvent.getSource().getBindingContext().getObject();
                this.Navigate({
                    target: {
                        semanticObject: "Manage",
                        action: "DGAMgmt",
                        params: {
                            DgaId: oBj["DGAId"]
                        }
                    }
                });
            },
            
            Navigate: function (oSemAct) {
                if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
                    var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
                    oCrossAppNav.toExternal({
                        target: {
                            semanticObject: oSemAct.target.semanticObject,
                            action: oSemAct.target.action
                        },
                        params: oSemAct.target.params
                    })
                }
            },

        });
    }
);