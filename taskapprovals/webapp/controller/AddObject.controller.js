sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/ValueState",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, ValueState, Fragment, MessageBox, MessageToast) {
    "use strict";

    return BaseController.extend("com.knpl.dga.taskapproval.controller.AddObject", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {
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
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Add").attachMatched(this._onRouterMatched, this);
        },
        _onRouterMatched: function (oEvent) {
            var sPainterId = oEvent.getParameter("arguments").Id;
            this._initData();
        },
        _initData: function () {
            var oView = this.getView();
            var othat = this;
            var c1, c2, c3;
            var c1 = othat._AddObjectControlModel("Add", null);
            c1.then(function () {
                c1.then(function () {
                    c2 = othat._setInitViewModel();
                    c2.then(function () {
                        c3 = othat._LoadAddFragment("AddLead");
                        c3.then(function () {
                            oView.getModel("oModelControl").setProperty("/PageBusy", false)
                        })
                    })
                })
            })

        },
        _setInitViewModel: function () {
            /*
             * Author: manik saluja
             * Date: 02-Dec-2021
             * Language:  JS
             * Purpose: Used to set the view data model that is bindined to value fields of control in xml
             */
            var promise = jQuery.Deferred();
            var oView = this.getView();
            var oDataView = {
                ConsumerName:"",
                PrimaryNum:"",
                Email:"",
                Pincode:"",
                StateId:"",
                District:"",
                CityOrTown:"",
                Landmark:"",
                Address:"",
                LeadSourceId:"1"
            }
            var oModel1 = new JSONModel(oDataView);
            oView.setModel(oModel1, "oModelView");
            promise.resolve();
            return promise;
        },
        _LoadAddFragment: function (mParam) {
            var promise = jQuery.Deferred();
            var oView = this.getView();
            var othat = this;
            var oVboxProfile = oView.byId("oVBoxAddObjectPage");
            var sResourcePath = oView.getModel("oModelControl").getProperty("/resourcePath")
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

        _handlePinCodeValueHelpConfirm: function (oEvent) {
            // this method is overwritten for the pincode in the worklist view
            var oView = this.getView();
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var oViewModel = this.getView().getModel("oModelView"),
                oModelControl = this.getView().getModel("oModelControl");
            var obj = oSelectedItem.getBindingContext().getObject();
            oModelControl.setProperty(
                "/AddFields/PinCode",
                obj["Name"]
            );
            oViewModel.setProperty(
                "/Pincode",
                obj["Name"]
            );
            var sDistrictPath = obj["District"].__ref;
            var sCityPath = obj["City"].__ref;
            var sDistrictName = oView.getModel().getProperty("/"+sDistrictPath).Name;
            var sCityName = oView.getModel().getProperty("/"+sCityPath).City;
            oViewModel.setProperty("/StateId", obj["StateId"]);
            oViewModel.setProperty("/CityOrTown", sCityName);
            oViewModel.setProperty("/District", sDistrictName);
            // var cmbxcity = oView.byId("cmbCity");
            // cmbxcity.clearSelection();
            // cmbxcity.getBinding("items").filter(new Filter("StateId", FilterOperator.EQ, obj["StateId"]));
            // var cmbxDistrict = oView.byId("cmbDistrict");
            // cmbxDistrict.clearSelection();
            // cmbxDistrict.getBinding("items").filter(new Filter("StateId", FilterOperator.EQ, obj["StateId"]));
            // oViewModel.setProperty("/CityOrTown", obj["City"]);
            this._onDialogClose();
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
            var othat = this;
            var c1, c2, c3, c4;
            var aFailureCallback = this._onCreationFailed.bind(this);
            c1 = othat._CheckEmptyFieldsPostPayload();
            c1.then(function (oPayload) {
                c2 = othat._CreateObject(oPayload)
                c2.then(function () {
                    c3 = othat._uploadFile();
                    c3.then(function () {
                        oModelControl.setProperty("/PageBusy", false);
                        othat.onNavToHome();
                    })
                }, aFailureCallback)
            })
        },
        _CreateObject: function (oPayLoad) {
            // console.log(oPayLoad);
            var othat = this;
            var oView = this.getView();
            var oDataModel = oView.getModel();
            var oModelControl = oView.getModel("oModelControl");
            return new Promise((resolve, reject) => {
                oDataModel.create("/Leads", oPayLoad, {
                    success: function (data) {
                        othat._showMessageToast("Message2")
                        resolve(data);
                    },
                    error: function (data) {
                        othat._showMessageToast("Message4")
                        reject(data);
                    },
                });
            });
        }

    });

});