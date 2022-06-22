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
], function (Controller, UIComponent, mobileLibrary, History, Fragment, JSONModel, Validator, MessageToast, MessageBox, Filter, FilterOperator) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return Controller.extend("com.knpl.dga.taskapproval.controller.BaseController", {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         * This module is used as a template for creating other modules in the KNPL Dga Applications
         * for creating the module kindly replate the following 
         * 1. com.knpl.dga.taskapproval
         * 2. com/knpl/dga/taskapproval - used in test folder for flp config
         * 3. com-knpl-dga-taskapproval - used in the manifest
         * 4  comknpldgataskapproval - used in test folder for flp config
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
                Id: mParam2,
                bindProp: "PainterComplainsSet(" + mParam2 + ")",
                EntitySet: "PainterComplainsSet",
                resourcePath: "com.knpl.dga.taskapproval",
                AddFields: {
                    PainterMobile: "",
                    PainterName: "",
                    PainterMembershipId: "",
                    PainterZone: "",
                    PainterDivision: "",
                    PainterDepot: ""
                }
            };
            var oModelControl = new JSONModel(oDataControl)
            oView.setModel(oModelControl, "oModelControl");
            promise.resolve()
            return promise;
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
        _propertyToBlank: function (aArray, sModelName) {
            var aProp = aArray;
            var oView = this.getView();
            var oModelView = oView.getModel(sModelName);
            for (var x of aProp) {
                var oGetProp = oModelView.getProperty("/" + x);
                if (Array.isArray(oGetProp)) {
                    oModelView.setProperty("/" + x, []);
                    //oView.byId(x.substring(x.indexOf("/") + 1)).fireChange();
                } else if (oGetProp === null) {
                    oModelView.setProperty("/" + x, null);
                } else if (oGetProp instanceof Date) {
                    oModelView.setProperty("/" + x, null);
                } else if (typeof oGetProp === "boolean") {
                    oModelView.setProperty("/" + x, false);
                } else {
                    oModelView.setProperty("/" + x, "");
                }
            }
            oModelView.refresh(true);
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
                "ComplaintTypeId",
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
        _CreateRadioButtonPayload: function (oPayLoad) {
            /*
            * Author: manik saluja
            * Date: 24-March-2022
            * Language:  JS
            * Purpose: This method is used to send the radiobutton data to the backend.
            */
            var promise = jQuery.Deferred();
            var oView = this.getView();
            var aBoleanProps = {
                IsTargetGroup: "TarGrp"
            };
            var oModelControl = oView.getModel("oModelControl");
            var oPropRbtn = oModelControl.getProperty("/Rbtn");
            for (var key in aBoleanProps) {
                if (oPropRbtn[aBoleanProps[key]] === 0) {
                    oPayLoad[key] = false;
                } else {
                    oPayLoad[key] = true;
                }
            }
            promise.resolve(oPayLoad);
            return promise;
        },
        _CreateMultiComboPayload: function (oPayload) {
            /*
            * Author: manik saluja
            * Date: 24-March-2022
            * Language:  JS
            * Purpose: This method is used to send the multicombo box with tokens or multi select popover data to the payload.
            */
            var promise = $.Deferred();
            var oView = this.getView();
            var oModelView = oView.getModel("oModelView");
            var oModelControl = oView.getModel("oModelControl");
            var sMode = oModelControl.getProperty("/mode");
            var sResults = ""
            if (sMode === "Edit") {
                sResults = "/results"
            }

            // Members - 
            // var aExistingMember = oModelView.getProperty("/Members" + sResults);
            // var aSelectedMember = oModelControl.getProperty("/MultiCombo/Members")
            // var iMembers = -1;
            // var aMembers = [];
            // for (var x of aSelectedMember) {
            //     iMembers = aExistingMember.findIndex(item => parseInt(item["Id"]) === parseInt(x["Id"]))
            //     if (iMembers >= 0) {

            //         aMembers.push(aExistingMember[iMembers]);
            //     } else {
            //         aMembers.push({ Id: parseInt(x["Id"]) });
            //     }
            // }
            // oPayload["Members"] = aMembers;
            // // zone 
            // var aExistingMember = oModelView.getProperty("/NotificationGroupZone" + sResults);
            // var aSelectedMember = oModelControl.getProperty("/MultiCombo/Zone");
            // var iMembers = -1;
            // var aMembers = [];
            // for (var x of aSelectedMember) {
            //     iMembers = aExistingMember.findIndex(item => item["ZoneId"] === x)
            //     if (iMembers >= 0) {

            //         aMembers.push(aExistingMember[iZone]);
            //     } else {
            //         aMembers.push({ ZoneId: x });
            //     }
            // }
            // oPayload["NotificationGroupZone"] = aZone;
            promise.resolve(oPayload);
            return promise

        },
        _CreatePayLoadTable: function (oPayload) {
            var promise = $.Deferred();
            /*
            * Author: manik saluja
            * Date: 24-March-2022
            * Language:  JS
            * Purpose: This method is used to send the data from the ui5 table control to the payload.
            */
            promise.resolve(oPayload);
            return promise;
        },
        _onCreationFailed: function (mParam1) {
            // mParam1 > error object
            if (mParam1) {
                if (mParam1.hasOwnProperty("statusCode")) {
                    if (mParam1.statusCode == 409) {
                        this._showMessageBox2("error", "Message13", [mParam1.responseText]);
                    }
                }
            }

            var oModelControl = oView.getModel("oModelDisplay");
            oModelControl.setProperty("/PageBusy", false);

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
        _handlePValueHelpSearch: function (oEvent) {
            /*
             * Author: manik saluja
             * Date: 29-March-2022
             * Language:  JS
             * Purpose: This method is used to manage the search for the dialog boxes or value help dialogs
             * 
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
                this._PinCodeValueHelp
                    .getBinding("items")
                    .filter(aFilter, "Application");
                return;
            }

        },
        _onDialogClose: function () {
            /*
                Internal method to handle the closure of all the dialogs
                if dialog 1 is open first and on top over that dialog 2 is open
                then dialog 2 code for closure should be written before dialog 1

                value help with select dialog box wont require to close they just are required 
                to get destroyed
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
        },
        // painter value help request
        onPainterValueHelpRequest: function (oEvent) {
            var sInputValue = oEvent.getSource().getValue(),
                oView = this.getView(), oModelControl = oView.getModel("oModelControl");

            if (!this._pValueHelpDialog) {
                this._pValueHelpDialog = Fragment.load({
                    id: oView.getId(),
                    name: oModelControl.getProperty("/resourcePath") + ".view.fragments.PainterValueHelpDialog",
                    controller: this,
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pValueHelpDialog.then(function (oDialog) {
                // Create a filter for the binding
                oDialog
                    .getBinding("items")
                    .filter([
                        new Filter(
                            [
                                new Filter(
                                    {
                                        path: "Name",
                                        operator: "Contains",
                                        value1: sInputValue.trim(),
                                        caseSensitive: false
                                    }
                                ),
                                new Filter(
                                    {
                                        path: "Mobile",
                                        operator: "Contains",
                                        value1: sInputValue.trim(),
                                        caseSensitive: false
                                    }
                                ),
                            ],
                            false
                        ),
                    ]);
                // Open ValueHelpDialog filtered by the input's value
                oDialog.open(sInputValue);
            });
        },
        onPainterValueHelpSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter(
                [
                    new Filter(
                        {
                            path: "Name",
                            operator: "Contains",
                            value1: sValue.trim(),
                            caseSensitive: false
                        }
                    ),
                    new Filter(
                        {
                            path: "Mobile",
                            operator: "Contains",
                            value1: sValue.trim(),
                            caseSensitive: false
                        }
                    )
                ],
                false
            );

            oEvent.getSource().getBinding("items").filter([oFilter]);
        },
        onPainterValueHelpClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);
            var oViewModel = this.getView().getModel("oModelView"),
                oModelControl = this.getView().getModel("oModelControl");
            if (!oSelectedItem) {
                return;
            }
            var obj = oSelectedItem.getBindingContext().getObject();
            oViewModel.setProperty("/PainterId", obj["Id"]);
            oModelControl.setProperty("/AddFields/PainterMobile", obj["Mobile"]);
            oModelControl.setProperty("/AddFields/PainterName", obj["Name"]);
            oModelControl.setProperty("/AddFields/PainterMembershipId", obj["MembershipCard"]);
            oModelControl.setProperty("/AddFields/PainterDivision", obj.DivisionId);
            oModelControl.setProperty("/AddFields/PainterZone", obj.ZoneId);

            oModelControl.setProperty("/AddFields/PainterDepot", "");
            //Fallback as Preliminary context not supported


        }

    });

});