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
        _dummyPromise: function (oPayload) {
            var promise = $.Deferred();
            promise.resolve(oPayload)
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
             * Date: 02-Mar-2022
             * Language:  JS
             * Purpose: used to create omodelcontrol that is binded to the view or used to store static data
             */
            var promise = jQuery.Deferred();
            var oView = this.getView();
            var oDataControl = {
                PageBusy: true,
                Pagetitle: mParam1 === "Add" ? "Add" : "Edit",
                mode: mParam1,
                Id: mParam2,
                bindProp: "DGAs(" + mParam2 + ")",
                resourcePath: "com.knpl.dga.dgamanage",
                AddFields: {
                    Pincode: "",
                    SalesGroup: "",
                    JoiningDate: "",
                    ExitDate: ""
                },
                MultiCombo: {
                    Dealers: [],
                    Pincode2:[]
                }
            };
            var oModelControl = new JSONModel(oDataControl)
            oView.setModel(oModelControl, "oModelControl");
            promise.resolve()
            return promise;
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

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        _geti18nText: function (mParam, mParam2) {
            /*
             * Author: manik saluja
             * Date: 15-Mar-2022
             * Language:  JS
             * Purpose: This is the for getting the i18n text with additional paramters
             */
            var oModel = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            return oModel.getText(mParam, mParam2);
        },
        _showMessageToast: function (mParam, mParam2) {
            /*
             * Author: manik saluja
             * Date: 15-Mar-2022
             * Language:  JS
             * Purpose: A common method of controllers to call the messgae toast with the property
             */
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
            console.log(sMessage);
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
        _onCreationFailed: function (mParam1) {
            // mParam1 > error object

            var sMessage;
            if (mParam1.statusCode == 409) {
                this._showMessageBox2("error", "Message13", [mParam1.responseText]);
             
            }

        },
        _uploadFile: function (oPayLoad) {
            var promise = jQuery.Deferred();
            promise.resolve(oPayLoad);
            return promise;
        },
        onJoiningDate: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");
            var oModelView = oView.getModel("oModelView");
            var oDateNow = new Date().setHours(0, 0, 0, 0);
            var oExitDate = oModelView.getProperty("/ExitDate")
            var oDate = oEvent.getSource().getDateValue();
            if (oDate > oDateNow) {
                this._showMessageToast("Message10")
                oModelControl.setProperty("/AddFields/JoiningDate", "");
                oModelView.setProperty("/JoiningDate", null);
                return;
            }
            if (oExitDate) {
                if (oDate > oExitDate) {
                    this._showMessageToast("Message11")
                    oModelControl.setProperty("/AddFields/JoiningDate", "");
                    oModelView.setProperty("/JoiningDate", null);
                    return;
                }
            }


        },
        onExitDateChange: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");
            var oModelView = oView.getModel("oModelView");
            var oJoinDate = oModelView.getProperty("/JoiningDate")
            var oDate = oEvent.getSource().getDateValue();
            if (oJoinDate) {
                if (oDate < oJoinDate) {
                    this._showMessageToast("Message12")
                    oModelControl.setProperty("/AddFields/ExitDate", "");
                    oModelView.setProperty("/ExitDate", null);
                    return;
                }
            }

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
        _handlePValueHelpSearch: function (oEvent) {
            /*
            * Author: manik saluja
            * Date: 15-Mar-2022
            * Language:  JS
            * Purpose: A common method of controllers handle the search for the popovers
            */
            var sValue = oEvent.getParameter("value").trim();
            var sPath = oEvent.getParameter("itemsBinding").getPath();
            // Pincodes Valuehelp
            if (sPath === "/MasterPincodes") {
                if (sValue.length > 0) {
                    var aFilter = new Filter({
                        path: "Name",
                        operator: "Contains",
                        value1: sValue,
                        caseSensitive: false,
                    });
                } else {
                    var aFilter = [];
                }
                if(this._PinCodeValueHelp){
                    this._PinCodeValueHelp
                    .getBinding("items")
                    .filter(aFilter, "Application");
                }
                if(this._PinCodeValueHelp2){
                    this._PinCodeValueHelp2
                    .getBinding("items")
                    .filter(aFilter, "Application");
                }
               
                return;
            }
           
            // Dealers Valuehelp

            if (sPath === "/DealerSet") {
                if (sValue.length > 0) {
                    var aFilter = new Filter(
                        [
                            new Filter({
                                path: "DealerName",
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
                        ],
                        false
                    )


                } else {
                    var aFilter = [];
                }
                this._DealerValueHelpDialog
                    .getBinding("items")
                    .filter(aFilter, "Application");
                return;
            }
            // sales group
            if (sPath === "/MasterSaleGroups") {
                if (sValue.length > 0) {
                    var aFilter = new Filter({
                        path: "Name",
                        operator: "Contains",
                        value1: sValue,
                        caseSensitive: false,
                    });


                } else {
                    var aFilter = [];
                }
                this._SalesGroupValueHelp
                    .getBinding("items")
                    .filter(aFilter, "Application");
                return;
            }

        },

        _onDialogClose: function () {
            /*
            * Author: manik saluja
            * Date: 15-Mar-2022
            * Language:  JS
            * Purpose:  Internal method to handle the closure of all the dialogs
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
                if (this._ChangeStatus.isOpen()) {
                    this._ChangeStatus.close();
                }
            }
            if (this._PinCodeValueHelp) {
                this._PinCodeValueHelp.destroy();
                delete this._PinCodeValueHelp;
                return;
            }
            if (this._PinCodeValueHelp2) {
                this._PinCodeValueHelp2.destroy();
                delete this._PinCodeValueHelp2;
                return;
            }
            if (this._DealerValueHelpDialog) {
                this._DealerValueHelpDialog.destroy();
                delete this._DealerValueHelpDialog;
                return;
            }
            if (this._SalesGroupValueHelp) {
                this._SalesGroupValueHelp.destroy();
                delete this._SalesGroupValueHelp;
                return;
            }
        },
        _handleSalesGropValueHelp: function () {
            /*
            * Author: manik saluja
            * Date: 15-Mar-2022
            * Language:  JS
            * Purpose:  Used to handle the sales group pop over in the add dga and edit dga.
            */
            var oView = this.getView();
            if (!this._SalesGroupValueHelp) {
                this._getViewFragment("SalesGroupValueHelp").then(function (oControl) {
                    this._SalesGroupValueHelp = oControl;
                    oView.addDependent(this._SalesGroupValueHelp);
                    this._SalesGroupValueHelp.open();
                }.bind(this))
            }

        },
        _handlePinCodeValueHelp: function () {
            /*
            * Author: manik saluja
            * Date: 15-Mar-2022
            * Language:  JS
            * Purpose:  Used to handle the pin code pop over in the add dga and edit dga.
            */
            var oView = this.getView();
            if (!this._PinCodeValueHelp) {
                this._getViewFragment("PinCodeValueHelp").then(function (oControl) {
                    this._PinCodeValueHelp = oControl;
                    oView.addDependent(this._PinCodeValueHelp);
                    this._PinCodeValueHelp.open();
                }.bind(this))
            }
        },
        _handlePinCodeValueHelp2: function () {
            /*
            * Author: manik saluja
            * Date: 15-Mar-2022
            * Language:  JS
            * Purpose:  Used to handle the pin code pop over in the add dga and edit dga.
            */
            var oView = this.getView();
            if (!this._PinCodeValueHelp2) {
                this._getViewFragment("PinCodeValueHelp2").then(function (oControl) {
                    this._PinCodeValueHelp2 = oControl;
                    oView.addDependent(this._PinCodeValueHelp2);
                    this._PinCodeValueHelp2.open();
                }.bind(this))
            }
        },
        _handleSalesGroupConfirm: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var oViewModel = this.getView().getModel("oModelView"),
                oModelControl = this.getView().getModel("oModelControl");
            var obj = oSelectedItem.getBindingContext().getObject();
            oModelControl.setProperty(
                "/AddFields/SalesGroup",
                obj["Name"]
            );
            oViewModel.setProperty(
                "/SaleGroupId",
                obj["Id"]
            );

            this._onDialogClose();
        },
        _handlePinCodeValueHelpConfirm: function (oEvent) {
            // this method is overwritten for the pincode in the worklist view
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var oViewModel = this.getView().getModel("oModelView"),
                oModelControl = this.getView().getModel("oModelControl");
            var obj = oSelectedItem.getBindingContext().getObject();
            oModelControl.setProperty(
                "/AddFields/PinCode",
                obj["Name"]
            );
            oViewModel.setProperty(
                "/PincodeId",
                obj["Id"]
            );

            this._onDialogClose();

        },
        _handlePinCodeValueHelpConfirm2: function (oEvent) {
            // this method is overwritten for the pincode in the worklist view
          
            var oSelected = oEvent.getParameter("selectedContexts");
            var oView = this.getView();
            var oModel = oView.getModel("oModelControl");
            var aDealers = [],
                oBj;
            for (var a of oSelected) {
                oBj = a.getObject();
                aDealers.push({
                    Name: oBj["Name"],
                    Id: oBj["Id"],
                });
            }

            oModel.setProperty("/MultiCombo/Pincode2", aDealers);
            oModel.refresh(true);
            this._onDialogClose();

        },
        handleDealersValueHelp: function () {
            /*
            * Author: manik saluja
            * Date: 15-Mar-2022
            * Language:  JS
            * Purpose:  This method is used to open the popover for selecting the linked dealers in the 
            * add dga form. 
            */
            var oView = this.getView();
            if (!this._DealerValueHelpDialog) {
                this._getViewFragment("DealersValueHelp").then(function (oControl) {
                    this._DealerValueHelpDialog = oControl;
                    oView.addDependent(this._DealerValueHelpDialog);
                    this._DealerValueHelpDialog.open();
                }.bind(this));
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
                    Name: oBj["DealerName"],
                    Id: oBj["Id"],
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