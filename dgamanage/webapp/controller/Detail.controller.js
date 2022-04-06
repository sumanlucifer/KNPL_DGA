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
            "com.knpl.dga.dgamanage.controller.Detail", {
            formatter: formatter,

            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("Detail").attachMatched(this._onRouteMatched, this);

                sap.ui.getCore().attachValidationError(function (oEvent) {
                    if (oEvent.getParameter("element").getRequired()) {
                        oEvent.getParameter("element").setValueState(ValueState.Error);
                    } else {
                        oEvent.getParameter("element").setValueState(ValueState.None);
                    }
                });
                sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.None);
                });

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
                    bindProp: "DGAs(" + oProp + ")",
                    Id: oProp,
                    PageBusy: true,
                    IcnTabKey: "0",
                    resourcePath: "com.knpl.dga.dgamanage",
                    ChangeStatus: {

                    }
                };
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "oModelDisplay");
                if (sMode == "Edit") {
                    this._initEditData();
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
                // c1 = othat._CheckLoginData();
                c1 = othat._dummyPromise();
                c1.then(function () {
                    c2 = othat._getDisplayData(oData["bindProp"]);
                    c2.then(function () {
                        c3 = othat._LoadFragment("DisplayDetails");
                        c3.then(function () {
                            oModel.setProperty("/PageBusy", false)
                        })
                    })
                })
            },
            _initEditData: function () {
                var oView = this.getView();
                var othat = this;
                var oModel = oView.getModel("oModelDisplay");
                oModel.setProperty("/PageBusy", true);
                var sProp = oModel.getProperty("/bindProp")
                oModel.setProperty("/mode", "Edit");
                var oData = oModel.getData();
                var c1, c2, c2A, c3, c4;
                var c1 = othat._AddObjectControlModel("Edit", oData["Id"]);
                oModel.setProperty("/PageBusy", true);
                c1.then(function () {
                    c1.then(function () {
                        c2 = othat._setInitViewModel();
                        c2.then(function () {
                            c2A = othat._dummyPromise(oModel.getProperty("/bindProp"));
                            c2A.then(function () {
                                c3 = othat._LoadFragment("AddNewObjectEdit");
                                c3.then(function () {
                                    c4 = othat._SetFiltersForControls();
                                    c4.then(function (oPayLoad) {
                                        othat._setEditPopoverData(oPayLoad);
                                        c4.then(function () {
                                            oModel.setProperty("/PageBusy", false);
                                        })
                                    })
                                })
                            })

                        })
                    })
                })

            },
            _setEditPopoverData: function (oPayLoad) {
                var promise = $.Deferred();
                // set the data for pin code poper

                promise.resolve(oPayLoad)
                return oPayLoad;
            },
            onPressEdit: function () {
                var oView = this.getView();
                var sId = oView.getModel("oModelDisplay").getProperty("/Id")
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Detail", {
                    Id: sId,
                    Mode: "Edit"
                });
            },
            _SetFiltersForControls: function () {
                var promise = $.Deferred();
                var oView = this.getView();
                var oModelView = oView.getModel("oModelView");
                var oPayload = oModelView.getData();
                // set filers for Division, Depot
                // var sZoneId = oPayload["Zone"];
                // if (sZoneId !== null) {
                //     oView
                //         .byId("idDivision")
                //         .getBinding("items")
                //         .filter(new Filter("Zone", FilterOperator.EQ, sZoneId));
                // }
                // var sDivisionId = oPayload["DivisionId"];
                // if (sDivisionId !== null) {
                //     oView
                //         .byId("idDepot")
                //         .getBinding("items")
                //         .filter(new Filter("Division", FilterOperator.EQ, sDivisionId));
                // }
                promise.resolve(oPayload);
                return promise;



            },
            _setInitViewModel: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                var oModel = oView.getModel("oModelDisplay")
                var oProp = oModel.getProperty("/bindProp");
                var exPand = "SaleGroup,PayrollCompany,Depot,Division,DGADealers,Pincode,Town,State,DGAContractors,LinkedContractors,WorkLocation,ServicePincodes";
                return new Promise((resolve, reject) => {
                    oView.getModel().read("/" + oProp, {
                        urlParameters: {
                            $expand: exPand,
                        },
                        success: function (data) {

                            var oModel = new JSONModel(data);
                            oView.setModel(oModel, "oModelView");
                            resolve(data);
                        },
                        error: function () { },
                    });
                });
            },
            _CheckLoginData: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oData = oView.getModel();
                var oLoginModel = oView.getModel("LoginInfo");
                var oControlModel = oView.getModel("oModelDisplay");
                var oLoginData = oLoginModel.getData();

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
                                        oControlModel.setProperty(
                                            "/LoggedInUser",
                                            data["results"][0]
                                        );
                                    }
                                }
                                resolve();
                            },
                        });
                    });
                } else {
                    oControlModel.setProperty("/LoggedInUser", oLoginData);
                    promise.resolve();
                    return promise;
                }

            },

            _getDisplayData: function (oProp) {
                var promise = jQuery.Deferred();
                var oView = this.getView();

                var exPand = "SaleGroup,PayrollCompany,Depot,Division,DGADealers,Pincode,Town,State,DGAContractors,WorkLocation,LinkedContractors,ServicePincodes/Pincode";
                var othat = this;
                if (oProp.trim() !== "") {
                    oView.bindElement({
                        path: "/" + oProp,
                        parameters: {
                            expand: exPand
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
                var oModel = oView.getModel();
                var sEntitySet = oView.getModel("oModelDisplay").getProperty("/bindProp");

                if (sKey == "1") {
                    oView.byId("Dealerstable").setEntitySet(sEntitySet);
                    console.log(sEntitySet);
                } else if (sKey == "2") {
                    var oTable = oView.byId("idContractorTable")
                    oTable.bindItems({
                        path: "LinkedContractors/",
                        template: oView.byId("oColumListItemContrators"),
                        templateShareable: true,
                    })

                } else if (sKey == "3") {
                    oView.byId("idLeadsTable").rebindTable();
                }
            },
            // #smart table filters
            onBeforeRebindDealersTable: function (oEvent) {
                var oView = this.getView();
                var sDgaId = oView.getModel("oModelDisplay").getProperty("/Id");
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.parameters["expand"] = "Dealer";
                oBindingParams.sorter.push(new Sorter("CreatedAt", true));

            },
            onBeforeBindLeadsTable: function (oEvent) {
                var oView = this.getView();
                var sDgaId = oView.getModel("oModelDisplay").getProperty("/Id")
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.parameters["expand"] = "LeadServiceType,State,Depot,LeadStatus";
                var oFiler = new Filter("DGAId", FilterOperator.EQ, sDgaId)
                oBindingParams.filters.push(oFiler);
                oBindingParams.sorter.push(new Sorter("CreatedAt", true));

            },
            onBeforeBindContractorTbl: function (oEvent) {
                console.log("contractor table trigerred");
                var oView = this.getView();
                var oBindingParams = oEvent.getParameter("bindingParams");
                // oBindingParams.parameters["expand"] = "Contractor";
                // var oFiler = new Filter("IsLinked", FilterOperator.EQ, true);
                // oBindingParams.filters.push(oFiler);
                // oBindingParams.sorter.push(new Sorter("CreatedAt", true));
            },

            _LoadFragment: function (mParam) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oVboxProfile = oView.byId("oVBoxAddObjectPage");
                oVboxProfile.destroyItems();
                return this._getViewFragment(mParam).then(function (oControlProfile) {
                    oView.addDependent(oControlProfile);
                    oVboxProfile.addItem(oControlProfile);
                    promise.resolve();
                    return promise;
                });
            },
            onPressSave: function () {
                var bValidateForm = this._ValidateForm();
                if (bValidateForm) {
                    this._postDataToSave();
                }

            },
            _ValidateForm: function () {
                var oView = this.getView();
                var oValidate = new Validator();
                var othat = this;
                var oForm = oView.byId("FormObjectData");
                var bFlagValidate = oValidate.validate(oForm, true);
                if (!bFlagValidate) {
                    othat._showMessageToast("Message3")
                    return false;
                }
                return true;
            },
            _postDataToSave: function () {
                /*
                 * Author: manik saluja
                 * Date: 02-Dec-2021
                 * Language:  JS
                 * Purpose: Payload is ready and we have to send the same based to server but before that we have to modify it slighlty
                 */
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelDisplay");
                oModelControl.setProperty("/PageBusy", true);
                var othat = this;
                var c1, c2, c3;
                c1 = othat._CheckEmptyFieldsPostPayload();
                var aFailureCallback = this._onCreationFailed.bind(this);
                c1.then(function (oPayload) {
                    c2 = othat._UpdatedObject(oPayload)
                    c2.then(function () {
                        c3 = othat._uploadFile();
                        c3.then(function () {
                            oModelControl.setProperty("/PageBusy", false);
                            othat.onNavToHome();
                        })
                    }, aFailureCallback)
                })


            },

            onChangeStatus: function () {
                var oView = this.getView(),
                    aStatus = [{
                        key: "ACTIVATED"
                    }, {
                        key: "DEACTIVATED"
                    }],
                    oModelControl = oView.getModel("oModelDisplay"),
                    sCurrentStatus = null,//oView.getBindingContext().getProperty("ActivationStatus"),
                    oChangeStatus = {
                        aApplicableStatus: aStatus.filter(ele => ele.key != sCurrentStatus),
                        oPayload: {
                            ActivationStatus: "",
                            ActivationStatusChangeReason: ""
                        }
                    };
                oModelControl.setProperty("/ChangeStatus", oChangeStatus);
                // create dialog lazily
                if (!this._ChangeStatus) {
                    // load asynchronous XML fragment
                    this._getViewFragment("ChangeStatus").then(function (oControl) {
                        console.log(oControl)
                        this._ChangeStatus = oControl;
                        oView.addDependent(this._ChangeStatus);
                        this._ChangeStatus.open();
                    }.bind(this));
                } else {
                    this._ChangeStatus.open();
                }
            },
            onConfirmStatus: function () {
                var oPayload = this.getView().getModel("oModelDisplay").getProperty("/ChangeStatus/oPayload");
                if (!oPayload.ActivationStatus)
                    return;
                if (!oPayload.ActivationStatusChangeReason)
                    return;
                var sPath = this.getView().getBindingContext().getPath();
                console.log(oPayload);
                // this.getView().getModel().update(sPath +
                //     "/ActivationStatus", oPayload, {
                //         success: function () {
                //             MessageToast.show(`Status has been changed to ${oPayload.ActivationStatus}`);
                //             this.onCloseStatus();
                //         }.bind(this)
                //     })
            },


            _UpdatedObject: function (oPayLoad) {
                var othat = this;
                var oView = this.getView();
                //console.log(oPayLoad);
                var oDataModel = oView.getModel();
                var oModelControl = oView.getModel("oModelControl");
                var sProp = oModelControl.getProperty("/bindProp")
                //console.log(sProp,oPayLoad)
                return new Promise((resolve, reject) => {
                    oDataModel.update("/" + sProp, oPayLoad, {
                        success: function (data) {
                            MessageToast.show(othat._geti18nText("Message1"));
                            resolve(data);
                        },
                        error: function (data) {
                            //MessageToast.show(othat._geti18nText("Message2"));
                            oModelControl.setProperty("/PageBusy", false);
                            reject(data);
                        },
                    });
                });
            }


        }

        );
    }
);