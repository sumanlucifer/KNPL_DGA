sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], function (Controller, UIComponent, mobileLibrary, History, Fragment, JSONModel, MessageToast, MessageBox, Filter, FilterOperator) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return Controller.extend("com.knpl.dga.dgamanage.controller.BaseController", {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
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
        _dummypromise: function () {
            var promise = $.Deferred();
            promise.resolve()
            return promise;
        },
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
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
        _AddObjectControlModel: function (mParam1, mParam2) {
            /*
             * Author: manik saluja
             * Date: 02-Dec-2021
             * Language:  JS
             * Purpose: used to create omodelcontrol that is binded to the view or used to store static data
             */
            var promise = jQuery.Deferred();
            var oView = this.getView();
            var oDataControl = {
                PageBusy: true,
                Pagetitle: mParam1 === "Add" ? "Add" : "Edit",
                mode: mParam1,
                ComplainId: mParam2,
                bindProp: "PainterComplainsSet(" + mParam2 + ")",
                resourcePath: "com.knpl.dga.dgamanage",
                AddFields: {
                    PainterMobile: "",
                    PainterName: "",
                    PainterMembershipId: "",
                    PainterZone: "",
                    PainterDivision: "",
                    PainterDepot: ""
                },
                MultiCombo: {
                    Dealers: []
                }
            };
            var oModelControl = new JSONModel(oDataControl)
            oView.setModel(oModelControl, "oModelControl");
            promise.resolve()
            return promise;
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
        _RemoveEmptyValue: function (mParam) {
            var obj = Object.assign({}, mParam);
            // remove string values
            for (var b in obj) {
                if (obj[b] === "") {
                    obj[b] = null;
                }
            }
            return obj;
        },
        _CheckEmptyFieldsPostPayload: function () {
            var promise = jQuery.Deferred();
            var oView = this.getView();
            var oModel = oView.getModel("oModelView");
            var oModelData = oModel.getData();
            //1.Clone the payload and convert string to integer values based on odata model entity
            var oPayLoad = this._RemoveEmptyValue(oModelData);
            var inTegerProperty = [

            ];
            for (var y of inTegerProperty) {
                if (oPayLoad.hasOwnProperty(y)) {
                    if (oPayLoad[y] !== null) {
                        oPayLoad[y] = parseInt(oPayLoad[y]);
                    }
                }
            }
            promise.resolve(oPayLoad);
            return promise;
        },
        _uploadFile: function (oPayLoad) {
            var promise = jQuery.Deferred();
            promise.resolve(oPayLoad);
            return promise;
        },

        /**
         * Event handler when the share by E-Mail button has been clicked
         * @public
         */
        onShareEmailPress: function () {
            var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
            URLHelper.triggerEmail(
                null,
                oViewModel.getProperty("/shareSendEmailSubject"),
                oViewModel.getProperty("/shareSendEmailMessage")
            );
        },
        onZoneChange: function (oEvent) {
            var sId = oEvent.getSource().getSelectedKey();
            var oView = this.getView();
            // setting value for division
            var oDivision = oView.byId("idDivision");
            oDivision.clearSelection();
            oDivision.setValue("");
            var oDivItems = oDivision.getBinding("items");
            oDivItems.filter(new Filter("Zone", FilterOperator.EQ, sId));
            //setting the data for depot;
            var oDepot = oView.byId("idDepot");
            oDepot.clearSelection();
            oDepot.setValue("");
            // clearning data for dealer
        },
        onDivisionChange: function (oEvent) {
            var sKey = oEvent.getSource().getSelectedKey();
            var oView = this.getView();
            var oDepot = oView.byId("idDepot");
            var oDepBindItems = oDepot.getBinding("items");
            oDepot.clearSelection();
            oDepot.setValue("");
            oDepBindItems.filter(new Filter("Division", FilterOperator.EQ, sKey));
        },
        _onDialogClose: function () {
            /*
                Internal method to handle the closure of all the dialogs
                if dialog 1 is open first and on top over that dialog 2 is open
                then dialog 2 code for closure should be written before dialog 1
            */
            if (this._pValueHelpDialog) {
                this._pValueHelpDialog.destroy();
                delete this._pValueHelpDialog;
                return;
            }

            if (this._ViewImageDialog) {
                if (this._ViewImageDialog.isOpen()) {
                    this._ViewImageDialog.close();
                    return;
                }
            }
            if (this._ChangeStatus) {
                this._ChangeStatus.close();
                this._ChangeStatus.destroy();
                delete this._ChangeStatus();
                return;
            }
            if (this._DealerValueHelpDialog) {
                this._DealerValueHelpDialog.destroy();
                delete this._DealerValueHelpDialog;
                return;
            }
        },
        handleDealersValueHelp: function () {
            var oView = this.getView();


            if (!this._DealerValueHelpDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: oView.getModel("oModelControl").getProperty("/resourcePath") + ".view.fragments.DealersValueHelp",
                    controller: this,
                }).then(
                    function (oValueHelpDialog) {
                        this._DealerValueHelpDialog = oValueHelpDialog;
                        oView.addDependent(this._DealerValueHelpDialog);
                        this._DealerValueHelpDialog.open();

                    }.bind(this)
                );
            }

        },
        _handleDealersValueHelpConfirm: function (oEvent) {
            var oSelected = oEvent.getParameter("selectedContexts");
            var oView = this.getView();
            var oModel = oView.getModel("oModelControl");
            var aDealers = [],
                oBj;
            for (var a of oSelected) {
                oBj = a.getObject();
                aDealers.push({
                    Name: oBj["Name"],
                    Id: oBj["ID"],
                });
            }
           
            oModel.setProperty("/MultiCombo/Dealers", aDealers);
            oModel.refresh(true);
            this._onDialogClose();


        },
        onDealersTokenUpdate: function (oEvent) {
            if (oEvent.getParameter("type") === "removed") {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var sPath = oEvent.getSource().getBinding("tokens").getPath();
                var aArray = oModel.getProperty(sPath);
                var aNewArray;
                var aRemovedTokens = oEvent.getParameter("removedTokens");
                var aRemovedKeys = [];
                aRemovedTokens.forEach(function (item) {
                    aRemovedKeys.push(item.getKey());
                });
                aNewArray = aArray.filter(function (item) {
                    return aRemovedKeys.indexOf(item["Id"]) < 0;
                });
                oModel.setProperty(sPath, aNewArray);
            }

        },




    });

});