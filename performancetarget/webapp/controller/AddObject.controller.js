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

    return BaseController.extend("com.knpl.dga.performancetarget.controller.AddObject", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {

            // sap.ui.getCore().attachValidationError(function (oEvent) {
            //     if (oEvent.getParameter("element").getRequired()) {
            //         oEvent.getParameter("element").setValueState(ValueState.Error);
            //     } else {
            //         oEvent.getParameter("element").setValueState(ValueState.None);
            //     }
            // });
            // sap.ui.getCore().attachValidationSuccess(function (oEvent) {
            //     oEvent.getParameter("element").setValueState(ValueState.None);
            // });


            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Add").attachMatched(this._onRouterMatched, this);


        },
        _onRouterMatched: function (oEvent) {
            var oView = this.getView();
            var icnTbTittle = {
                icnTbTittle: "",
                isSpecificZone: false,
                isSpecificDivision: false,
                isSpecificDepot: false
            }
            var oModel1 = new JSONModel(icnTbTittle);
            oView.setModel(oModel1, "titleModel");
            this.getView().getModel("titleModel").setProperty("/icnTbTittle", oEvent.getParameter("arguments").Tab);
            this.IconTb = oEvent.getParameter("arguments").Tab;
            // this.getView().byId("idAddObjectTitle").setText(this.IconTb);
             this.getView().byId("idAddObjectCrumb").setCurrentLocationText(this.IconTb);
            // this.getView().byId("idStepInpt").setText(this.IconTb + " Count ");
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
                        c3 = othat._LoadAddFragment("AddNewObjForm");
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
                Target: 0,
                Type: "",
                ToDate: "",
                FromDate: "",
                DGATypeId: "",
                PerformanceZone: [],
                PerformanceDivision:[],
                PerformanceDepot: [],
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
            var oVboxProfile = oView.byId("");
            var sResourcePath = oView.getModel("oModelControl").getProperty("/resourcePath")
            oVboxProfile.destroyItems();
            return this._getViewFragment(mParam).then(function (oControl) {
                oView.addDependent(oControl);
                oVboxProfile.addItem(oControl);
                promise.resolve();
                return promise;
            });
        },


        onPressSave: function () {
            var bValidateForm = this._ValidateForm();
            if (bValidateForm) {
                this._postDataToSave();
            }

           // this._postDataToSave();

        },
        _postDataToSave: function () {
            /*
             * Author: Mamta Singh
             * Date: 16-june-2022
             * Language:  JS
             * Purpose: Payload is ready and we have to send the same based to server but before that we have to modify it slighlty
             */
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");
            oModelControl.setProperty("/PageBusy", true);
           var ToDate;

           if(oModelControl.getProperty("/AddFields/Mode") === "0"){
               ToDate = new Date(oModelControl.getProperty("/AddFields/EndDate"))
           }
            else {
                var date = new Date(oModelControl.getProperty("/AddFields/EndDate"))
                ToDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
            }
// var oPayload = {
//     TargetValue: oModelControl.getProperty("/AddFields/Target"),
//     ToDate: ToDate,
//     FromDate: oModelControl.getProperty("/AddFields/StartDate"),
//     DGATypeId: oModelControl.getProperty("/Rbtn/TarGrp"),
//     TargetFrequencys: oModelControl.getProperty("/AddFields/Mode"),
// };

var icnTbTitle = this.getView().getModel("titleModel").getProperty("/icnTbTittle"), TargetTypeId;

switch(icnTbTitle){
    case "Lead Visit" : TargetTypeId = 2; break;
    case "New Lead" : TargetTypeId = 3; break;
    case "Contractor Visit" : TargetTypeId = 4; break;
    case "Dealer Visit" : TargetTypeId = 5; break;
    case "Lead Conversion" : TargetTypeId = 6; break;
    case "Bussiness Generation" : TargetTypeId = 7; 
}

var payLoad1 = {
    "TargetTypeId": TargetTypeId,
    "TargetValue": oModelControl.getProperty("/AddFields/Target"),
    "TargetFrequencys": oModelControl.getProperty("/AddFields/Mode") === "0" ? "DAILY" : "MONTHLY",
    "ToDate": ToDate,
    // "ToDate" : oModelControl.getProperty("/AddFields/EndDate"),
    "FromDate": new Date(oModelControl.getProperty("/AddFields/StartDate")),
    "DGATypeId": this.getView().getModel("oModelControl").getProperty("/Rbtn/TarGrp") === 0 ? "1" : "2",
    "IsSpecificZone": this.getView().getModel("titleModel").getProperty("/isSpecificZone"),
    "IsSpecificDivision": this.getView().getModel("titleModel").getProperty("/isSpecificDivision"),
    "IsSpecificDepot": this.getView().getModel("titleModel").getProperty("/isSpecificDepot"),
    "PerformanceZone": this.getView().getModel("titleModel").getProperty("/isSpecificZone") === true ? this._selectedItemsZone(this.getView().byId("idZone").getSelectedItems()) : [],
    "PerformanceDivision": this.getView().getModel("titleModel").getProperty("/isSpecificDivision") === true ? this._selectedItemsDivision(this.getView().byId("idDivision").getSelectedItems()) : [],
    "PerformanceDepot": this.getView().getModel("titleModel").getProperty("/isSpecificDepot") === true ? this._selectedItemsDepot(this.getView().byId("multiInputDepotAdd").getTokens()) : []
}

           // var aFailureCallback = this._onCreationFailed.bind(this);
           
            // var c1, c1b, c1c, c2, c3, c4;
            // c1 = othat._CheckEmptyFieldsPostPayload();
            // c1.then(function (oPayload) {
            //     c1b = othat._CreateRadioButtonPayload(oPayload);
            //     c1b.then(function (oPayload) {
            //         c1c=othat._CreateMultiComboPayload(oPayload)
            //         c1c.then(function(oPayload){
            //             c2 = othat._CreateObject(oPayload)
            //             // c2.then(function (oPayload) {
            //             //     c3 = othat._uploadFile(oPayload);
            //                 c2.then(function () {
            //                     oModelControl.setProperty("/PageBusy", false);
            //                     othat.onNavToHome();
            //                 })
            //             // })
            //         })
                   
            //     })
               
            // })
            var othat = this;
            this._CreateObject(payLoad1).then(function(data){
                oModelControl.setProperty("/PageBusy", false);
                othat.onNavToHome();
            });

        },
        _CreateObject: function (oPayLoad) {
            //console.log(oPayLoad);
            var othat = this;
            var oView = this.getView();
            var oDataModel = oView.getModel();
            var oModelControl = oView.getModel("oModelControl");
            return new Promise((resolve, reject) => {
                oDataModel.create("/MasterTargetPlansRenews", oPayLoad, {
                    success: function (data) {
                        othat._showMessageToast("Message2")
                        resolve(data);
                       // debugger;
                    },
                    error: function (data) {
                        oModelControl.setProperty("/PageBusy", false);
                        reject(data);
                    },
                });
            });
        },

        _selectedItemsZone:function(oController){

            return oController.map(function(o){ return {

                ZoneId: o.getBindingContext().getObject("Id"),

               // ComplaintSubtypeId: o.getBindingContext().getObject("Id")

            }});

        },

        _selectedItemsDivision:function(oController){

            return oController.map(function(o){ return {

                DivisionId: o.getBindingContext().getObject("Id"),

               // ComplaintSubtypeId: o.getBindingContext().getObject("Id")

            }});

        },

        _selectedItemsDepot:function(oController){

            return oController.map(function(o){ return {

                DepotId: o.getBindingContext("oModelControl").getObject("DepotId"),

               // ComplaintSubtypeId: o.getBindingContext().getObject("Id")

            }});

        },


        


        onModeChange: function(oEve)
        {
            
       var sKey = oEve.getSource().getSelectedKey();
            if(sKey === "0"){
               this.getView().byId("idFromDate").setDisplayFormat("dd/MM/yyyy");
                this.getView().byId("idToDate").setDisplayFormat("dd/MM/yyyy");
            }
            else if (sKey === "1")
            {
                 this.getView().byId("idFromDate").setDisplayFormat("MM-y");
                  this.getView().byId("idToDate").setDisplayFormat("MM-y");
              }
        },

        // onToChange : function(oEvent)
        // {
            
        // }

    });

});