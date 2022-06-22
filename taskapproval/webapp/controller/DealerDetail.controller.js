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
            "com.knpl.dga.taskapproval.controller.DealerDetail", {
            formatter: formatter,

            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("DealerDetail").attachMatched(this._onRouteMatched, this);
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
                var context = window.decodeURIComponent(
                    oEvent.getParameter("arguments").context
                );
                var oView = this.getView();
                var oView = this.getView();                
                var exPand = "Visit/DGA,Visit/TaskType,Status,Visit/TargetLead/SourceDealer,Visit/TargetLead/SourceContractor,Visit/TargetLead/LeadStatus,Visit/TargetContractor,Visit/TargetDealer";
                if (context.trim() !== "") {
                    oView.bindElement({
                        path: "/" + context,
                        parameters: {
                            expand: exPand,
                        }
                    });
                }

            },
            _setEditViewModel: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                var oModel = oView.getModel("oModelDisplay")
                var oProp = oModel.getProperty("/bindProp");
                var exPand = "ComplaintType";
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
            _SetEditRbtnData: function () {
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
            _SetEditMultiComboData: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                // var oModelControl = oView.getModel("oModelControl");
                // var oViewModel = oView.getModel("oModelView");
                // // initial multicombo without tokens aggregation
                // var sReceivers = [];
                // var sInitialReceivers = oViewModel.getProperty("/NotificationGroupZone/results");
                // for (var x of sInitialReceivers) {
                //     sReceivers.push(x["ZoneId"]);
                // }
                // oModelControl.setProperty("/MultiCombo/Zone", sReceivers);

                //  // initial multicombo with tokens aggregation
                // var sReceivers = [];
                // var sInitialReceivers = oViewModel.getProperty("/NotificationGroupDepot/results");
                // for (var x of sInitialReceivers) {
                //     sReceivers.push({DepotId:x["DepotId"]});
                // }
                // oModelControl.setProperty("/MultiCombo/Depot", sReceivers);

                promise.resolve();
                return promise;

            },
            _SetTableData: function () {
                var promise = $.Deferred();
                promise.resolve();
                return promise;
            },
            _SetAdditioanFlags: function () {
                var promise = $.Deferred();
                // this method will be used for setting up additonal flags and filter
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

                var exPand = "Painter,ComplaintType,ComplaintSubtype";
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

            _LoadFragment: function (mParam, mParam2) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                var oVboxProfile = oView.byId(mParam2);
                var sResourcePath = oView.getModel("oModelDisplay").getProperty("/resourcePath")
                oVboxProfile.destroyItems();
                return this._getViewFragment(mParam).then(function (oControl) {
                    oView.addDependent(oControl);
                    oVboxProfile.addItem(oControl);
                    promise.resolve();
                    return promise;
                });

            },
            _ReoveEditPayloadProps: function (oPayLoad) {
                var promise = $.Deferred();
                var aArrayRemoveProp1 = [];

                for (var x of aArrayRemoveProp) {
                    if (oPayLoad.hasOwnProperty(x)) {
                        delete oPayLoad[x];
                    }
                }
                //"ServicePincodes/Pincode"
                return promise;
            },
            onPressSave: function () {
                var bValidateForm = this._ValidateForm();
                if (bValidateForm) {
                    this._postDataToSave();
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
                var oModelControl = oView.getModel("oModelControl");
                oModelControl.setProperty("/PageBusy", true);
                var aFailureCallback = this._onCreationFailed.bind(this);
                var othat = this;
                var c1, c2, c3;
                c1 = othat._CheckEmptyFieldsPostPayload();
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
                            MessageToast.show(othat._showMessageToast("Message1"));
                            resolve(data);
                        },
                        error: function (data) {
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