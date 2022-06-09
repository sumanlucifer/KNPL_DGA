sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "../controller/Validator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/Device"
], function (Controller, UIComponent, mobileLibrary, History, Fragment, JSONModel, Validator, MessageToast, MessageBox, Filter, FilterOperator, Device) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return Controller.extend("com.knpl.dga.dealers.controller.BaseController", {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         * This module is used as a template for creating other modules in the KNPL Dga Applications
         * for creating the module kindly replate the following 
         * 1. com.knpl.dga.dealers
         * 2. com/knpl/dga/dealers - used in test folder for flp config
         * 3. com-knpl-dga-dealers - used in the manifest
         * 4  comknpldgadealers - used in test folder for flp config
         */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },
        _dummyPromise: function (oPayload) {
            var promise = $.Deferred();
            promise.resolve(oPayload);
            return promise;
        },
        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onNavToHome: function () {
            var sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                history.go(-1);
            } else {
                this.getRouter().navTo("worklist", {}, true);
            }
            // var oHistory = History.getInstance();
            // var sPreviousHash = oHistory.getPreviousHash();

            // if (sPreviousHash !== undefined) {
            //     window.history.go(-1);
            // } else {
            //     var oRouter = this.getOwnerComponent().getRouter();
            //     oRouter.navTo("worklist", {}, true);
            // }
        },
        onNavToHome2: function () {
            this.getRouter().navTo("worklist", {}, true);
        },
        _ValidateForm: function () {
            var oView = this.getView();
            var oValidate = new Validator();
            var othat = this;
            var oForm = oView.byId("FormObjectData");
            var bFlagValidate = oValidate.validate(oForm);
            if (!bFlagValidate) {
                othat._showMessageToast("Message3")
                return false;
            }
            return true;
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        _geti18nText: function (mParam, mParam2) {
            var oModel = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            return oModel.getText(mParam, mParam2);
        },
        _showMessageToast: function (mParam, mParam2) {
            var oModel = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            var sText = oModel.getText(mParam, mParam2);
            MessageToast.show(sText, {
                duration: 6000
            })
        },
        _showMessageBox1: function (pType, pMessage, pMessageParam, pfn1, pfn2) {
            // 
            /*pType(string) > type of message box ex: information or alert etc.
              pMessage (string)> i18n property name for the message
              pMessageParam(array/null)> i18n property has params specify in array or else pass as null
              pfn1(function1/null) > this is a function to be called after user presses yes 
              pfn2(function2/null) > this is a function to be called after user presses no

              you can call this below method like this
              this._showMessageBox1("information", "i18nProper", ["i18nParamerter1if any"],
              this._sample1.bind(this, "first paramters", "secondParameter"));
              In this code all the message type will have 2 buttons yes and no
            */
            var sMessage = this._geti18nText(pMessage, pMessageParam);
            var sPtye = pType.trim().toLowerCase();
            var othat = this;
            var aMessageType = ["success", "information", "alert", "error", "warning", "confirm"];

            if (aMessageType.indexOf(sPtye) >= 0) {
                MessageBox[sPtye](sMessage, {
                    actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (sAction) {
                        if (sAction === "YES") {
                            if (pfn1) {
                                pfn1();
                            }
                        } else {
                            if (pfn2) {
                                pfn2();
                            };
                        }
                    }
                });
                return
            } else {
                this._showMessageToast("Message6");
            }


        },
        _showMessageBox2: function (pType, pMessage, pMessageParam, pfn1, pfn2) {

            /*  pType(string) > type of message box ex: information or alert etc.
                pMessage (string)> i18n property name for the message
                pMessageParam(array/null)> i18n property has params specify in array or else pass as null
                pfn1(function1/null) > this is a function to be called after user presses yes 
                pfn2(function2/null) > this is a function to be called after user presses no

                you can call this below method like this
                this._showMessageBox1("information", "i18nProper", ["i18nParamerter1if any"],
                this._sample1.bind(this, "first paramters", "secondParameter"));

                In this code all the message type will have 1 button 
            */
            var sMessage = this._geti18nText(pMessage, pMessageParam);
            var sPtye = pType.trim().toLowerCase();
            var othat = this;
            var aMessageType = ["success", "information", "alert", "error", "warning"];


            if (aMessageType.indexOf(sPtye) >= 0) {
                MessageBox[sPtye](sMessage, {

                    onClose: function (sAction) {
                        // in case for error dialog we will have a close button insttead of okay
                        if (sAction === "OK" || sAction === "CLOSE") {
                            if (pfn1) {
                                pfn1();
                            }
                        } else {
                            if (pfn2) {
                                pfn2();
                            };
                        }
                    }
                });
                return
            } else {
                this._showMessageToast("Message6");
            }


        },
        _getViewFragment: function (sFragmentName) {
            /*
             * Author: manik saluja
             * Date: 14-March-2022
             * Language:  JS
             * Purpose: Common method to access fragmets from folder view.fragments. this method is 
             * written so that the developer dont writes the Fragment.load again.
             */
            var oView = this.getView();
            var oModel;
            if (oView.getModel("oModelControl")) {
                oModel = oView.getModel("oModelControl");
            } else {
                oModel = oView.getModel("oModelDisplay");
            }
            var othat = this;

            this._formFragments = Fragment.load({
                id: oView.getId(),
                name: oModel.getProperty("/resourcePath") + ".view.fragments." + sFragmentName,
                controller: othat,
            }).then(function (oFragament) {
                return oFragament;
            });
            return this._formFragments;
        },
        _handleDepotValueHelp: function (oEvent) {
            var oView = this.getView();
            if (!this._DepotValueHelp) {
                this._DepotValueHelp = Fragment.load({
                    id: oView.getId(),
                    name: "com.knpl.dga.dealers.view.fragments.DepotValueHelp",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    return oDialog;
                });
            }
            this._DepotValueHelp.then(function (oDialog) {
                var oList = oDialog.getAggregation("_dialog").getAggregation("content")[1];
                oDialog.open();
            }.bind(this));
        },
        _handleSalesGroupValueHelp: function (oEvent) {
            var oView = this.getView();
            if (!this._SalesGroupValueHelp) {
                this._SalesGroupValueHelp = Fragment.load({
                    id: oView.getId(),
                    name: "com.knpl.dga.dealers.view.fragments.SalesGroupValueHelp",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    return oDialog;
                });
            }
            this._SalesGroupValueHelp.then(function (oDialog) {
                var oList = oDialog.getAggregation("_dialog").getAggregation("content")[1];
                oDialog.open();
            }.bind(this));
        },
        _handleDepotValueHelpConfirm: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var oViewModel = this.getView().getModel("oModelView"),
                oModelControl = this.getView().getModel("oModelControl");
            var obj = oSelectedItem.getBindingContext().getObject();
            oModelControl.setProperty(
                "/filterBar/DepotId",
                obj["Id"]
            );
            this._onDialogClose();
        },
        _handleSalesGroupValueHelpConfirm: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var oViewModel = this.getView().getModel("oModelView"),
                oModelControl = this.getView().getModel("oModelControl");
            var obj = oSelectedItem.getBindingContext().getObject();
            oModelControl.setProperty(
                "/filterBar/SalesGroupId",
                obj["Id"]
            );
            this._onDialogClose();
        },
        _onDialogClose: function () {
            if (this._DepotValueHelp) {
                this._DepotValueHelp.destroy();
                delete this._DepotValueHelp;
                return;
            }
            if (this._SalesGroupValueHelp) {
                this._SalesGroupValueHelp.destroy();
                delete this._SalesGroupValueHelp;
                return;
            }
        },
        _handlePValueHelpSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value").trim();
            var sPath = oEvent.getParameter("itemsBinding").getPath();
            // Depot Valuehelp
            if (sPath === "/MasterDepots") {
                if (sValue.length > 0) {
                    var aFilter = new Filter([
                        new Filter({
                            path: "Depot",
                            operator: "Contains",
                            value1: sValue,
                            caseSensitive: false
                        }),
                        new Filter({
                            path: "Id",
                            operator: "Contains",
                            value1: sValue,
                            caseSensitive: false
                        })
                    ], false);
                }
                else {
                    var aFilter = [];
                }
                oEvent.getSource().getBinding("items").filter(aFilter);
                return;
            }
            //Sales Group Valuehelp
            if (sPath === "/MasterSalesGroupSet") {
                if (sValue.length > 0) {
                    var aFilter = new Filter([
                        new Filter({
                            path: "Description",
                            operator: "Contains",
                            value1: sValue,
                            caseSensitive: false
                        }),
                        new Filter({
                            path: "Id",
                            operator: "Contains",
                            value1: sValue,
                            caseSensitive: false
                        })
                    ], false);
                }
                else {
                    var aFilter = [];
                }
                oEvent.getSource().getBinding("items").filter(aFilter);
                return;
            }
        },



    });

});