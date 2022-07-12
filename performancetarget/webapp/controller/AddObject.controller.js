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
                isSpecificDepot: false,
                isSpecificLocation: false,
                isSpecificDGAType: false,
            }
            var oModel1 = new JSONModel(icnTbTittle);
            oView.setModel(oModel1, "titleModel");
            this.getView().getModel("titleModel").setProperty("/icnTbTittle", oEvent.getParameter("arguments").Tab);
            this.IconTb = oEvent.getParameter("arguments").Tab;
            // this.getView().byId("idAddObjectTitle").setText(this.IconTb);
            //  this.getView().byId("idAddObjectCrumb").setCurrentLocationText(this.IconTb);
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
                      //  c3 = othat._LoadAddFragment("AddNewObjForm");
                        // c3.then(function () {
                        //     oView.getModel("oModelControl").setProperty("/PageBusy", false)
                        // })
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
                CurrentDate: new Date(),
                CurrentMonth: new Date(),
                TargetValue: 0,
                Type: "",
                ToDate: "",
                FromDate: "",
                LeadVisit: {
                    "TargetTypeId": 2,
                    "ToDate": "",
                    "FromDate": "",
                    "TargetFrequencys": "DAILY",
                    "TargetValue": 0
                },
                NewLead: {
                    "TargetTypeId": 3,
                    "ToDate": "",
                    "FromDate": "",
                    "TargetFrequencys": "DAILY",
                    "TargetValue": 0
                },
                ContractorVisit: {
                    "TargetTypeId": 4,
                    "ToDate": "",
                    "FromDate": "",
                    "TargetFrequencys": "DAILY",
                    "TargetValue": 0
                },
                DealerVisit: {
                    "TargetTypeId": 5,
                    "ToDate": "",
                    "FromDate": "",
                    "TargetFrequencys": "DAILY",
                    "TargetValue": 0
                },
                LeadConversion: {
                    "TargetTypeId": 6,
                    "ToDate": "",
                    "FromDate": "",
                    "TargetFrequencys": "MONTHLY",
                    "TargetValue": 0
                },
                BusinessGeneration: {
                    "TargetTypeId": 7,
                    "ToDate": "",
                    "FromDate": "",
                    "TargetFrequencys": "MONTHLY",
                    "TargetValue": 0
                },
                DGATypeId: "",
                PerformanceZones: [],
                PerformanceDivisions: [],
                PerformanceDepots: [],
                PerformanceJobLocations: [],
            }
            var oModel1 = new JSONModel(oDataView);
            oView.setModel(oModel1, "oModelView");
            promise.resolve();
            return promise;
        },


        onFromDate: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");
            var oModelView = oView.getModel("oModelView");
            var oDateNow = new Date();
            var oToDate = oModelView.getProperty("/ToDate")
            var oDate = oEvent.getSource().getDateValue();
            // if (oDate > oDateNow) {
            //     this._showMessageToast("Message10")
            //     oModelControl.setProperty("/AddFields/LeadVisit/FromDate", "");

            //     // oModelView.setProperty("/LeadVisit/FromDate", "");
            //     return;
            // }
            if (oToDate) {
                if (oDate > oToDate) {
                    this._showMessageToast("Message11")
                    oModelControl.setProperty("/AddFields/LeadVisit/FromDate", "");
                    // oModelView.setProperty("/LeadVisit/FromDate", "");
                    return;
                }
            }


        },

        onToDate: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");
            // var oModelView = oView.getModel("oModelView");
            var oFromDate = new Date(oModelControl.getProperty("/AddFields/LeadVisit/FromDate"));
            var oDate = oEvent.getSource().getDateValue();
            if (oFromDate) {
                if (oDate < oFromDate) {
                    this._showMessageToast("Message12")
                    oModelControl.setProperty("/AddFields/LeadVisit/ToDate", "");
                    // oModelView.setProperty("/LeadVisit/ToDate", "");
                    return;
                }
            }
        },
        // _LoadAddFragment: function (mParam) {
        //     var promise = jQuery.Deferred();
        //     var oView = this.getView();
        //     var othat = this;
        //     var oVboxProfile = oView.byId("");
        //     var sResourcePath = oView.getModel("oModelControl").getProperty("/resourcePath")
        //     oVboxProfile.destroyItems();
        //     return this._getViewFragment(mParam).then(function (oControl) {
        //         oView.addDependent(oControl);
        //         oVboxProfile.addItem(oControl);
        //         promise.resolve();
        //         return promise;
        //     });
        // },


        onPressSave: function () {
            var bValidateForm = this._ValidateForm();
            // if (bValidateForm) {
            //     this._postDataToSave();
            // }

            this._postDataToSave();

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
            if(oModelControl.getProperty("/AddFields/LeadVisit/FromDate") && 
            oModelControl.getProperty("/AddFields/LeadVisit/ToDate") && 
            !oModelControl.getProperty("/AddFields/LeadVisit/TargetValue")){
                MessageToast.show("Kindly Enter the Value For Count");
                return;
            }
              
            if(oModelControl.getProperty("/AddFields/NewLead/FromDate") && 
            oModelControl.getProperty("/AddFields/NewLead/ToDate") && 
            !oModelControl.getProperty("/AddFields/NewLead/TargetValue")){
                MessageToast.show("Kindly Enter the Value For Count.");
                return;
            }
            
            if(oModelControl.getProperty("/AddFields/ContractorVisit/FromDate") && 
            oModelControl.getProperty("/AddFields/ContractorVisit/ToDate") && 
            !oModelControl.getProperty("/AddFields/ContractorVisit/TargetValue")){
                MessageToast.show("Kindly Enter the Value For Count.");
                return;
            }

            
            if(oModelControl.getProperty("/AddFields/DealerVisit/FromDate") && 
            oModelControl.getProperty("/AddFields/DealerVisit/ToDate") && 
            !oModelControl.getProperty("/AddFields/DealerVisit/TargetValue")){
                MessageToast.show("Kindly Enter the Value For Count.");
                return;
            }

            
            if(oModelControl.getProperty("/AddFields/LeadConversion/FromDate") && 
            oModelControl.getProperty("/AddFields/LeadConversion/ToDate") && 
            !oModelControl.getProperty("/AddFields/LeadConversion/TargetValue")){
                MessageToast.show("Kindly Enter the Value For Count.");
                return;
            }



            if(oModelControl.getProperty("/AddFields/BusinessGeneration/FromDate") && 
            oModelControl.getProperty("/AddFields/BusinessGeneration/ToDate") && 
            !oModelControl.getProperty("/AddFields/BusinessGeneration/TargetValue")){
                MessageToast.show("Kindly Enter the Value For Count.");
                return;
            }


            //var icnTbTitle = this.getView().getModel("titleModel").getProperty("/icnTbTittle"), TargetTypeId;


            var DGAType;
            var DGATypeBtn = this.getView().getModel("oModelControl").getProperty("/Rbtn/TarGrp");

            if (DGATypeBtn === 0)
                DGAType = "1"
            else if (DGATypeBtn === 1)
                DGAType = "2"
            else if (DGATypeBtn === 2)
                DGAType = null
            var payLoad1 = {

                "DGATypeId": DGAType,

                "IsSpecificZone": this.getView().getModel("titleModel").getProperty("/isSpecificZone"),

                "IsSpecificDivision": this.getView().getModel("titleModel").getProperty("/isSpecificDivision"),

                "IsSpecificDepot": this.getView().getModel("titleModel").getProperty("/isSpecificDepot"),

                "IsSpecificJobLocation": this.getView().getModel("titleModel").getProperty("/isSpecificLocation"),

                "IsSpecificDGAType": DGAType === null ? false : true,
                "PerformanceZones": this.getView().getModel("titleModel").getProperty("/isSpecificZone") === true ? this._selectedItemsZone(this.getView().byId("idZone").getSelectedItems()) : [],

                "PerformanceDivisions": this.getView().getModel("titleModel").getProperty("/isSpecificDivision") === true ? this._selectedItemsDivision(this.getView().byId("idDivision").getSelectedItems()) : [],

                "PerformanceDepots": this.getView().getModel("titleModel").getProperty("/isSpecificDepot") === true ? this._selectedItemsDepot(this.getView().byId("multiInputDepotAdd").getTokens()) : [],

                "PerformanceJobLocations": this.getView().getModel("titleModel").getProperty("/isSpecificLocation") === true ? this._selectedItemsLocation(this.getView().byId("idLocation").getTokens()) : [],

                "PerformanceTargetDetails": this._performanceTargetDetails()

            }


            var othat = this;
            this._CreateObject(payLoad1).then(function (data) {
                oModelControl.setProperty("/PageBusy", false);
                othat.onNavToHome();
            });

        },

        _monthlyDateFormat: function (toDate) {
            var date = new Date(toDate), ToDate;
            ToDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            return ToDate;
        }
        ,
        _performanceTargetDetails: function () {
            var aPerformanceTargetArray = [];
            var oTitleModel = this.getView().getModel("oModelControl");
          
           

            // if(oTitleModel.getProperty("/AddFields/LeadVisit/FromDate")){
            if (oTitleModel.getProperty("/AddFields/LeadVisit/ToDate")) {
                oTitleModel.setProperty("/AddFields/LeadVisit/FromDate", new Date(oTitleModel.getProperty("/AddFields/LeadVisit/FromDate")));
                oTitleModel.setProperty("/AddFields/LeadVisit/ToDate", new Date(oTitleModel.getProperty("/AddFields/LeadVisit/ToDate")));
                aPerformanceTargetArray.push(oTitleModel.getProperty("/AddFields/LeadVisit/"));
            }
            // else {
            //     MessageToast.show("Enter To Date");
            //     return;
            // }
            // }
    

            if (oTitleModel.getProperty("/AddFields/NewLead/FromDate")) {
                oTitleModel.setProperty("/AddFields/NewLead/FromDate", new Date(oTitleModel.getProperty("/AddFields/NewLead/FromDate")));
                oTitleModel.setProperty("/AddFields/NewLead/ToDate", new Date(oTitleModel.getProperty("/AddFields/NewLead/ToDate")));
                aPerformanceTargetArray.push(oTitleModel.getProperty("/AddFields/NewLead/"));
            }
            if (oTitleModel.getProperty("/AddFields/ContractorVisit/FromDate")) {
                oTitleModel.setProperty("/AddFields/ContractorVisit/FromDate", new Date(oTitleModel.getProperty("/AddFields/ContractorVisit/FromDate")));
                oTitleModel.setProperty("/AddFields/ContractorVisit/ToDate", new Date(oTitleModel.getProperty("/AddFields/ContractorVisit/ToDate")));
                aPerformanceTargetArray.push(oTitleModel.getProperty("/AddFields/ContractorVisit/"));
            }
            if (oTitleModel.getProperty("/AddFields/DealerVisit/FromDate")) {
                oTitleModel.setProperty("/AddFields/DealerVisit/FromDate", new Date(oTitleModel.getProperty("/AddFields/DealerVisit/FromDate")));
                oTitleModel.setProperty("/AddFields/DealerVisit/ToDate", new Date(oTitleModel.getProperty("/AddFields/DealerVisit/ToDate")));
                aPerformanceTargetArray.push(oTitleModel.getProperty("/AddFields/DealerVisit/"));
            }
            if (oTitleModel.getProperty("/AddFields/LeadConversion/FromDate")) {
                var DateObj = this._monthlyDateFormat(oTitleModel.getProperty("/AddFields/LeadConversion/ToDate"));
                oTitleModel.setProperty("/AddFields/LeadConversion/ToDate", DateObj);
                oTitleModel.setProperty("/AddFields/LeadConversion/FromDate", new Date(oTitleModel.getProperty("/AddFields/LeadConversion/FromDate").split("/")[0]+"/01/"+oTitleModel.getProperty("/AddFields/LeadConversion/FromDate").split("/")[1]));
                aPerformanceTargetArray.push(oTitleModel.getProperty("/AddFields/LeadConversion/"));
            }
            if (oTitleModel.getProperty("/AddFields/BusinessGeneration/FromDate")) {
                var DateObj = this._monthlyDateFormat(oTitleModel.getProperty("/AddFields/BusinessGeneration/ToDate"));
                oTitleModel.setProperty("/AddFields/BusinessGeneration/ToDate", DateObj);
                oTitleModel.setProperty("/AddFields/BusinessGeneration/FromDate", new Date(oTitleModel.getProperty("/AddFields/BusinessGeneration/FromDate").split("/")[0]+"/01/"+oTitleModel.getProperty("/AddFields/BusinessGeneration/FromDate").split("/")[1]));
                aPerformanceTargetArray.push(oTitleModel.getProperty("/AddFields/BusinessGeneration/"));
            }

            return aPerformanceTargetArray;
        },
        _CreateObject: function (oPayLoad) {
            //console.log(oPayLoad);
            var othat = this;
            var oView = this.getView();
            var oDataModel = oView.getModel();
            var oModelControl = oView.getModel("oModelControl");
            return new Promise((resolve, reject) => {
                oDataModel.create("/MasterTargetPlansReconstructs", oPayLoad, {
                    success: function (data) {
                        othat._showMessageToast("Message2")
                        resolve(data);
                        // debugger;
                    },
                    error: function (data) {
                        oModelControl.setProperty("/PageBusy", false);
                        MessageBox.error(data.responseText);
                        reject(data);
                    },
                });
            });
        },

        _selectedItemsZone: function (oController) {

            return oController.map(function (o) {
                return {

                    ZoneId: o.getBindingContext().getObject("Id"),

                    // ComplaintSubtypeId: o.getBindingContext().getObject("Id")

                }
            });

        },

        _selectedItemsDivision: function (oController) {

            return oController.map(function (o) {
                return {

                    DivisionId: o.getBindingContext().getObject("Id"),

                    // ComplaintSubtypeId: o.getBindingContext().getObject("Id")

                }
            });

        },

        _selectedItemsDepot: function (oController) {

            return oController.map(function (o) {
                return {

                    DepotId: o.getBindingContext("oModelControl").getObject("DepotId"),

                    // ComplaintSubtypeId: o.getBindingContext().getObject("Id")

                }
            });

        },
        _selectedItemsLocation: function (oController) {

            return oController.map(function (o) {
                return {

                    JobLocationId: o.getBindingContext("oModelControl").getObject("TownId"),

                    // ComplaintSubtypeId: o.getBindingContext().getObject("Id")

                }
            });

        },

        onFromDate1: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");

            var oDateNow = new Date();
            var oToDate = oModelControl.getProperty("/ToDate")
            var oDate = oEvent.getSource().getDateValue();
            // if (oDate > oDateNow) {
            //     this._showMessageToast("Message10")
            //     oModelControl.setProperty("/AddFields/NewLead/FromDate", "");


            //     return;
            // }
            if (oToDate) {
                if (oDate > oToDate) {
                    this._showMessageToast("Message11")
                    oModelControl.setProperty("/AddFields/NewLead/FromDate", "");

                    return;
                }
            }


        },

        onToDate1: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");

            var oFromDate = new Date(oModelControl.getProperty("/AddFields/NewLead/FromDate"));
            var oDate = oEvent.getSource().getDateValue();
            if (oFromDate) {
                if (oDate < oFromDate) {
                    this._showMessageToast("Message12")
                    oModelControl.setProperty("/AddFields/NewLead/ToDate", "");

                    return;
                }
            }
        },

        onFromDate2: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");

            var oDateNow = new Date();
            var oToDate = oModelControl.getProperty("/ToDate")
            var oDate = oEvent.getSource().getDateValue();
            // if (oDate > oDateNow) {
            //     this._showMessageToast("Message10")
            //     oModelControl.setProperty("/AddFields/ContractorVisit/FromDate", "");


            //     return;
            // }
            if (oToDate) {
                if (oDate > oToDate) {
                    this._showMessageToast("Message11")
                    oModelControl.setProperty("/AddFields/ContractorVisit/FromDate", "");

                    return;
                }
            }


        },

        onToDate2: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");

            var oFromDate = new Date(oModelControl.getProperty("/AddFields/ContractorVisit/FromDate"));
            var oDate = oEvent.getSource().getDateValue();
            if (oFromDate) {
                if (oDate < oFromDate) {
                    this._showMessageToast("Message12")
                    oModelControl.setProperty("/AddFields/ContractorVisit/ToDate", "");

                    return;
                }
            }
        },
        
        onFromDate3: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");

            var oDateNow = new Date();
            var oToDate = oModelControl.getProperty("/ToDate")
            var oDate = oEvent.getSource().getDateValue();
            // if (oDate > oDateNow) {
            //     this._showMessageToast("Message10")
            //     oModelControl.setProperty("/AddFields/DealerVisit/FromDate", "");


            //     return;
            // }
            if (oToDate) {
                if (oDate > oToDate) {
                    this._showMessageToast("Message11")
                    oModelControl.setProperty("/AddFields/DealerVisit/FromDate", "");

                    return;
                }
            }


        },

        onToDate3: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");

            var oFromDate = new Date(oModelControl.getProperty("/AddFields/DealerVisit/FromDate"));
            var oDate = oEvent.getSource().getDateValue();
            if (oFromDate) {
                if (oDate < oFromDate) {
                    this._showMessageToast("Message12")
                    oModelControl.setProperty("/AddFields/DealerVisit/ToDate", "");

                    return;
                }
            }
        },

        onFromDate4: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");

            var oDateNow = new Date();
            var oToDate =  new Date(oModelControl.getProperty("/AddFields/LeadConversion/ToDate"))
            var oDate = oEvent.getSource().getDateValue();
            // if (oDate > oDateNow) {
            //     this._showMessageToast("Message13")
            //     oModelControl.setProperty("/AddFields/LeadConversion/FromDate", "");


            //     return;
            // }
            if (!isNaN(oToDate)) {
                if (oDate > oToDate) {
                    this._showMessageToast("Message14")
                    oModelControl.setProperty("/AddFields/LeadConversion/FromDate", "");

                    return;
                }
            }


        },

        onToDate4: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");
            var oFromDate = new Date(oModelControl.getProperty("/AddFields/LeadConversion/FromDate"));
            var oFromDate = new Date(oModelControl.getProperty("/AddFields/LeadConversion/FromDate").split("/")[0]+"/01/"+oModelControl.getProperty("/AddFields/LeadConversion/FromDate").split("/")[1]);
            var oDate = oEvent.getSource().getDateValue();
            if (oFromDate) {
                if (oDate < oFromDate) {
                    this._showMessageToast("Message15")
                    oModelControl.setProperty("/AddFields/LeadConversion/ToDate", "");

                    return;
                }
            }
        },

        onFromDate5: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");

            var oDateNow = new Date();
            var oToDate = oModelControl.getProperty("/AddFields/BusinessGeneration/ToDate")
            var oDate = oEvent.getSource().getDateValue();
            // if (oDate > oDateNow) {
            //     this._showMessageToast("Message13")
            //     oModelControl.setProperty("/AddFields/BusinessGeneration/FromDate", "");


            //     return;
            // }
            if (oToDate) {
                if (oDate > oToDate) {
                    this._showMessageToast("Message14")
                    oModelControl.setProperty("/AddFields/BusinessGeneration/FromDate", "");

                    return;
                }
            }


        },

        onToDate5: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");

            var oFromDate = new Date(oModelControl.getProperty("/AddFields/BusinessGeneration/FromDate").split("/")[0]+"/01/"+oModelControl.getProperty("/AddFields/BusinessGeneration/FromDate").split("/")[1]);
            var oDate = oEvent.getSource().getDateValue();
            if (oFromDate) {
                if (oDate < oFromDate) {
                    this._showMessageToast("Message15")
                    oModelControl.setProperty("/AddFields/BusinessGeneration/ToDate", "");

                    return;
                }
            }
        },



        //     onModeChange: function(oEve)
        //     {

        //    var sKey = oEve.getSource().getSelectedKey();
        //         if(sKey === "0"){
        //            this.getView().byId("idFromDate").setDisplayFormat("dd/MM/yyyy");
        //             this.getView().byId("idToDate").setDisplayFormat("dd/MM/yyyy");
        //         }
        //         else if (sKey === "1")
        //         {
        //              this.getView().byId("idFromDate").setDisplayFormat("MM-y");
        //               this.getView().byId("idToDate").setDisplayFormat("MM-y");
        //           }
        //     },


    });

});