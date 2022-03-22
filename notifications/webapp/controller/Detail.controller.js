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
            "com.knpl.dga.notifications.controller.Detail", {
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
            onAfterRendering: function () {

            },
            _SetDisplayData: function (oProp, sMode) {
                var oData = {
                    mode: sMode,
                    bindProp: "NotificationSet('" + oProp + "')",
                    Id: oProp,
                    PageBusy: true,
                    IcnTabKey: "0",
                    resourcePath: "com.knpl.dga.notifications"
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
                var sProp = oModel.getProperty("/bindProp")
                var oData = oModel.getData();
                var c1, c2, c3, c3b, c4;
                var c1 = othat._AddObjectControlModel("Edit", oData["Id"]);
                oModel.setProperty("/PageBusy", true);
                c1.then(function () {
                    c2 = othat._setInitViewModel();
                    c2.then(function () {
                        c3 = othat._LoadFragment("AddComplaint");
                        c3.then(function () {
                            c3b = othat._setAdditioanlFlags();
                            c3b.then(function () {
                                c4 = othat._getMultiComboData();
                                c4.then(function () {
                                    oModel.setProperty("/PageBusy", false);
                                })
                            })

                        })
                    })

                })

            },
            _setAdditioanlFlags: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oViewModel = oView.getModel("oModelView");
                if (!oViewModel.getProperty("/ScheduledDate")) {
                    oViewModel.setProperty("/IsLater", false)
                } else {
                    oViewModel.setProperty("/IsLater", true);
                    //oModelControl.setProperty("/ScheduledDate")
                }
                promise.resolve();
                return promise;
            },
            _getMultiComboData: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oViewModel = oView.getModel("oModelView");
                var sReceivers = [];
                var sInitialReceivers = oViewModel.getProperty("/Receivers");
                for (var x of sInitialReceivers["results"]) {
                    sReceivers.push({ Id: x["Id"], PainterName: x["PainterName"] })
                }
                oModelControl.setProperty("/MultiCombo/Receivers", sReceivers);
                promise.resolve();
                return promise;

            },
            _setInitViewModel: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                var oModel = oView.getModel("oModelDisplay")
                var oProp = oModel.getProperty("/bindProp");
                var exPand = "Receivers";
                return new Promise((resolve, reject) => {
                    oView.getModel().read("/" + oProp, {
                        urlParameters: {
                            $expand: exPand,
                        },
                        success: function (data) {

                            var oModel = new JSONModel(data);
                            oView.setModel(oModel, "oModelView");
                            resolve();
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
                console.log("display data trigerred")
                var exPand = "Receivers,Group";
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
                    oView.byId("HistoryTable").rebindTable();
                }
            },
            onBeforeRebindHistoryTable: function (oEvent) {
                var oView = this.getView();
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.sorter.push(new Sorter("UpdatedAt", true));
            },

            _LoadFragment: function (mParam) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                var oVboxProfile = oView.byId("oVBoxAddObjectPage");
                var sResourcePath = oView.getModel("oModelDisplay").getProperty("/resourcePath")
                oVboxProfile.destroyItems();
                return this._getViewFragment(mParam).then(function (oControl) {
                    oView.addDependent(oControl);
                    oVboxProfile.addItem(oControl);
                    promise.resolve();
                    return promise;
                });

            },
            onPressSave: function (sStatusType) {
                //SCHEDULED DRAFT
                var bValidateForm = this._ValidateForm();
                var bValidateReceivers = this._CheckReceivers.bind(this);

                if (bValidateForm) {
                    if (bValidateReceivers()) {
                        this._postDataToSave(sStatusType);
                    }
                }

            },
            _postDataToSave: function (sStatusType) {
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
                var c1, c1A, c2, c3, c4;
                c1 = othat._CheckEmptyFieldsPostPayload(sStatusType);
                c1.then(function (oPayload) {
                    c1A = othat._AddMultiComboData(oPayload);
                    c1A.then(function (oPayload) {
                        c2 = othat._UpdatedObject(oPayload)
                        c2.then(function () {
                            c3 = othat._uploadFile();
                            c3.then(function () {
                                oModelControl.setProperty("/PageBusy", false);
                                othat.onNavToHome();
                            })
                        })
                    })

                })




            },
            _UpdatedObject: function (oPayLoad) {
                var othat = this;
                var oView = this.getView();
                var oDataModel = oView.getModel();
                var oModelControl = oView.getModel("oModelDisplay");
                var sProp = oModelControl.getProperty("/bindProp")
                //console.log(sProp,oPayLoad)
                return new Promise((resolve, reject) => {
                    oDataModel.update("/" + sProp, oPayLoad, {
                        success: function (data) {
                            othat._showMessageToast("Message1")
                            resolve(data);
                        },
                        error: function (data) {
                            othat._showMessageToast("Message4")
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