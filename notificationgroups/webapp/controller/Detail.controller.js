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
        "../model/customMulti"
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
        formatter,
        customMulti
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.dga.notificationgroups.controller.Detail", {
                formatter: formatter,
            customMulti: customMulti,

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
                    bindProp: "NotificationGroups(" + oProp + ")",
                    Id: oProp,
                    EntitySet: "NotificationGroups",
                    PageBusy: true,
                    IcnTabKey: "0",
                    resourcePath: "com.knpl.dga.notificationgroups",

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
                var c1, c2, c3, c3b, c3c, c3d;
                var oModel = this.getView().getModel("oModelDisplay");
                var oData = oModel.getData();
                var othat = this;
                oModel.setProperty("/PageBusy", true);
                c1 = othat._dummyPromise();
                c1.then(function () {
                    c2 = othat._getDisplayData(oData["bindProp"]);
                    c2.then(function () {
                        c3 = othat._LoadFragment("DisplayForm1", "oVbox1");
                        c3.then(function () {
                            c3b = othat._LoadFragment("DisplayForm2", "oVbox2");
                            c3b.then(function () {
                                c3c = othat._LoadFragment("DisplayForm3", "oVbox3");
                                c3c.then(function () {
                                    c3d = othat._LoadFragment("DisplayForm4", "oVbox4");
                                    oModel.refresh(true);
                                    oModel.setProperty("/PageBusy", false)
                                })

                            })
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
                var c1, c2, c3, c3b, c3c, c3d, c4, c5;
                var c1 = othat._AddObjectControlModel("Edit", oData["Id"]);
                oModel.setProperty("/PageBusy", true);
                c1.then(function () {
                    c1.then(function () {
                        c2 = othat._setInitViewModel();
                        c2.then(function () {
                            c3 = othat._LoadFragment("AddForm1", "oVbox1");
                            c3.then(function () {
                                c3b = othat._LoadFragment("AddForm2", "oVbox2");
                                c3b.then(function () {
                                    c3c = othat._LoadFragment("AddForm3", "oVbox3");
                                    c3c.then(function () {
                                        c3d = othat._LoadFragment("AddForm4", "oVbox4");
                                        c3d.then(function () {
                                            c4 = othat._setRadiobuttonData();
                                            c4.then(function () {
                                                c5 = othat._getEditMultiComboData();
                                                c5.then(function () {
                                                    oModel.setProperty("/PageBusy", false);
                                                    oModel.refresh(true);
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })

            },
            _setRadiobuttonData: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oData = oView.getModel("oModelView").getData();
                var oModel = oView.getModel("oModelControl");
                var oRbtn = oModel.getProperty("/Rbtn");
                var aBoleanProps = {
                    IsTargetGroup: "TarGrp"
                };
                for (var a in aBoleanProps) {

                    if (oData[a] === true) {
                        oRbtn[aBoleanProps[a]] = 1;
                    } else {
                        oRbtn[aBoleanProps[a]] = 0;
                    }
                }
                promise.resolve(oData);
                return promise;

            },
            _setInitViewModel: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                var oModel = oView.getModel("oModelDisplay")
                var oProp = oModel.getProperty("/bindProp");
                var exPand = "Members/DGA,NotificationGroupZone,NotificationGroupDivision,NotificationGroupDepot";
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
            _getEditMultiComboData: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oViewModel = oView.getModel("oModelView");
                var sReceivers = [];
                var sInitialReceivers = oViewModel.getProperty("/Members/results");
                for (var x of sInitialReceivers) {
                    sReceivers.push(Object.assign({}, x));
                }
                oModelControl.setProperty("/MultiCombo/Members", sReceivers);
                // zone multicombo with selectedkeys
                var sReceivers = [];
                var sInitialReceivers = oViewModel.getProperty("/NotificationGroupZone/results");
                for (var x of sInitialReceivers) {
                    sReceivers.push(x["ZoneId"]);
                }
                oModelControl.setProperty("/MultiCombo/Zone", sReceivers);

                var sReceivers = [];
                var sInitialReceivers = oViewModel.getProperty("/NotificationGroupDivision/results");
                for (var x of sInitialReceivers) {
                    sReceivers.push(x["DivisionId"]);
                }
                oModelControl.setProperty("/MultiCombo/Division", sReceivers);

                var sReceivers = [];
                var sInitialReceivers = oViewModel.getProperty("/NotificationGroupDepot/results");
                for (var x of sInitialReceivers) {
                    sReceivers.push({ DepotId: x["DepotId"] });
                }
                oModelControl.setProperty("/MultiCombo/Depot", sReceivers);

                promise.resolve();
                return promise;

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

                var exPand = "Members";
                var othat = this;
                if (oProp.trim() !== "") {
                    return new Promise((resolve, reject) => {
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
                                    resolve()
                                    //  oView.setBusy(false);
                                },
                            },
                        });
                    })
                }

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

            _LoadFragment: function (mParam, sVBoxId) {

                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                var oVboxProfile = oView.byId(sVBoxId);
                var sResourcePath = oView.getModel("oModelDisplay").getProperty("/resourcePath")
                oVboxProfile.destroyItems();
                return this._getViewFragment(mParam).then(function (oControl) {
                    oView.addDependent(oControl);
                    oVboxProfile.addItem(oControl);
                    promise.resolve();
                    return promise;
                });

            },
            onPressSave: function () {
                var bValidateForm = this._ValidateForm("Edit");
                var bVlidateMember = this._ValidateMembers.bind(this);
                if (bValidateForm) {
                    if (bVlidateMember()) {
                        this._postDataToSave();
                    }
                }

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
                var c1, c1b, c1c,c1d, c2, c3, c4;
                c1 = othat._CheckEmptyFieldsPostPayload();
                c1.then(function (oPayload) {
                    c1b = othat._CreateRadioButtonPayload(oPayload);
                    c1b.then(function (oPayload) {
                        c1c = othat._CreateMultiComboPayload(oPayload)
                        c1c.then(function (oPayload) {
                            c1d = othat._RemoveNavigationProp(oPayload);
                            c1d.then(function(oPayload){
                                c2 = othat._UpdatedObject(oPayload)
                                c2.then(function (oPayload) {
                                    c3 = othat._uploadFile(oPayload);
                                    c3.then(function () {
                                        oModelControl.setProperty("/PageBusy", false);
                                        othat.onNavToHome();
                                    })
                                })
                            })
                        })
                    })
                })

            },
            _UpdatedObject: function (oPayLoad) {
                var othat = this;
                var oView = this.getView();
                var oDataModel = oView.getModel();
                var oModelControl = oView.getModel("oModelControl");
                var sProp = oModelControl.getProperty("/bindProp")
              
                return new Promise((resolve, reject) => {
                    oDataModel.update("/" + sProp, oPayLoad, {
                        success: function (data) {
                            othat._showMessageToast("Message1");
                            resolve(data);
                        },
                        error: function (data) {
                            othat._showMessageToast("Message2");
                            reject(data);
                        },
                    });
                });
            }


        }

        );
    }
);