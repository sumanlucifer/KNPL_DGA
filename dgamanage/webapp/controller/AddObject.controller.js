sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/library",
    "sap/ui/core/ValueState",
    "com/knpl/dga/dgamanage/controller/Validator",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",


], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, library, ValueState, Validator, Fragment, MessageBox, MessageToast) {
    "use strict";

    return BaseController.extend("com.knpl.dga.dgamanage.controller.AddObject", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {
            /*
            * Author: manik saluja
            * Date: 15-Mar-2022
            * Language:  JS
            * Purpose: In the initi we are configuring the view/control for the following
            * 1. Field level validation using  the sap internal method of validation check
            * 2. Setting up the routing method
            */
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


            this._ValueState = library.ValueState;
            this._MessageType = library.MessageType;


            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Add").attachMatched(this._onRouterMatched, this);


        },
        _onRouterMatched: function (oEvent) {
            var sPainterId = oEvent.getParameter("arguments").Id;
            this._initData();
        },
        _initData: function () {
            /*
            * Author: manik saluja
            * Date: 15-Mar-2022
            * Language:  JS
            * Purpose:  Following is the flow 
            * 1. Setting up the control model which holds the field level and general flag values that are not a part of payload
            * 2.  _setInitView model we are seeting the oModelView which will be replica of the payload that is sent to the backend
            * 3. Loading the fresh fragment that has the form displaying the initial values
            */
            var oView = this.getView();
            var othat = this;
            var c1, c2, c3;
            var c1 = othat._AddObjectControlModel("Add", null);
            c1.then(function () {
                c1.then(function () {
                    c2 = othat._setInitViewModel();
                    c2.then(function () {
                        c3 = othat._LoadAddFragment("AddNewObject");
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
             * Date: 01-Mar-2022
             * Language:  JS
             * Purpose: Used to set the view data model that is bindined to value fields of control in xml
             */
            var promise = jQuery.Deferred();
            var oView = this.getView();
            var oDataView = {
                GivenName: "",
                Mobile: "",
                //SaleGroupId: "",
                PincodeId: "",
                PayrollCompanyId: "",
                Zone: "",
                DivisionId: "",
                DepotId: "",
                DGADealers: [],
                ServicePincodes: [],
                StateId: "",
                //TownId: "",
                EmployeeId: "",
                JoiningDate: null,
                ExitDate: null,
                WorkLocationId: "",
                ChildTowns:[],
                AllocatedDGACount:""

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
      
        // onStateChange: function (oEvent) {
        //    console.log("new state change")
        // },

        onPressSave: function () {
            /*
            * Author: manik saluja
            * Date: 01-Mar-2022
            * Language:  JS
            * Purpose: Method is triggered when we have click save on the add form
            */
            var bValidateForm = this._ValidateForm();
            var bValidateFields = this._ValidateEmptyFields.bind(this);
            if (bValidateForm) {
                if (bValidateFields()) {
                    this._postDataToSave();
                }
            }

        },
        _ValidateForm: function () {
            /*
             * Author: manik saluja
             * Date: 15-Mar-2022
             * Language:  JS
             * Purpose: This method validates the fields in the form based on the configuration given in the property binding of the particular control.
             */
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
             * Date: 01-Mar-2022
             * Language:  JS
             * Purpose: Modify the payload so that its compatible with the backend server requirement. 
             * 1. _CheckEmptyFieldsPostPayload used to check the empty string values and convert it into null and also clone the payload from omodeview
             * 2._AddMultiComboData is used to set values of the multicombobx feilds from oModelControl to the payload.
             * 3. _CreateObject to send the request with the payload to the backend
             * 4. _UploadFile if its required to upload file based on the created object id.
             */
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");
            oModelControl.setProperty("/PageBusy", true);
            var othat = this;
            var c1, c1B, c2, c3, c4;
            var aFailureCallback = this._onCreationFailed.bind(this);
            c1 = othat._CheckEmptyFieldsPostPayload();
            c1.then(function (oPayload) {
                c1B = othat._AddMultiComboData(oPayload);
                c1B.then(function (oPayload) {
                    c2 = othat._CreateObject(oPayload)
                    c2.then(function () {
                        c3 = othat._uploadFile();
                        c3.then(function () {
                            oModelControl.setProperty("/PageBusy", false);
                            othat.onNavToHome();
                        })
                    }, aFailureCallback)
                })
            })


        },
        _AddMultiComboData: function (oPayload) {
            var promise = $.Deferred();
            var oView = this.getView();
            var oModelView = oView.getModel("oModelView");
            var oModelControl = oView.getModel("oModelControl");
            // Dealers Combobox - 
            var aExistingDealers = oModelView.getProperty("/DGADealers");
            var aSelectedDealers = oModelControl.getProperty("/MultiCombo/Dealers")
            var iDealers = -1;
            var aDealers = [];
            for (var x of aSelectedDealers) {
                iDealers = aExistingDealers.findIndex(item => item["Id"] === x["Id"])
                if (iDealers >= 0) {
                    //oPayload["PainterExpertise"][iExpIndex]["IsArchived"] = false;
                    aDealers.push(oPayload["DGADealers"][iDealers]);
                } else {
                    aDealers.push({ DealerId: x["Id"] });
                }
            }
            oPayload["DGADealers"] = aDealers;
            var aExistingData = oModelView.getProperty("/ServicePincodes");
            var aSelectedData = oModelControl.getProperty("/MultiCombo/Pincode2")
            var iData = -1;
            var aDataFinal = [];
            for (var x of aSelectedData) {
                iData = aExistingData.findIndex(item => item["Id"] === x["Id"])
                if (iData >= 0) {
                    //oPayload["PainterExpertise"][iExpIndex]["IsArchived"] = false;
                    aDataFinal.push(oPayload["ServicePincodes"][iData]);
                } else {
                    aDataFinal.push({ PincodeId: x["Id"] });
                }
            }
            oPayload["ServicePincodes"] = aDataFinal;
            var aExistingData = oModelView.getProperty("/ChildTowns");
            var aSelectedData = oModelControl.getProperty("/MultiCombo/ChildTowns")
            var iData = -1;
            var aDataFinal = [];
            for (var x of aSelectedData) {
                    aDataFinal.push({ WorkLocationId: x["Id"] });
            }
            oPayload["ChildTowns"] = aDataFinal;
            promise.resolve(oPayload);
            return promise

        },
        _CreateObject: function (oPayLoad) {
            console.log(oPayLoad);
            var othat = this;
            var oView = this.getView();
            var oDataModel = oView.getModel();
            var oModelControl = oView.getModel("oModelControl");
            console.log(oModelControl.getData())
            return new Promise((resolve, reject) => {
                //resolve();
                oDataModel.create("/DGAs", oPayLoad, {
                    success: function (data) {
                        othat._showMessageToast("Message2")
                        resolve(data);
                    },
                    error: function (data) {
                        oModelControl.getProperty("/PageBusy", false);
                        //othat._showMessageToast("Message4")
                        reject(data);
                    },
                });
            });
        },


    });

});