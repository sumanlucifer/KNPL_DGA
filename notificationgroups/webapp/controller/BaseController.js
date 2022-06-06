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

    return Controller.extend("com.knpl.dga.notificationgroups.controller.BaseController", {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         * This module is used as a template for creating other modules in the KNPL Dga Applications
         * for creating the module kindly replate the following 
         * 1. com.knpl.dga.notificationgroups
         * 2. com/knpl/dga/notificationgroups - used in test folder for flp config
         * 3. com-knpl-dga-notificationgroups - used in the manifest
         * 4  comknpldganotificationgroups - used in test folder for flp config
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
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
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
                Id: mParam2,
                bindProp: "NotificationGroups(" + mParam2 + ")",
                EntitySet: "NotificationGroups",
                resourcePath: "com.knpl.dga.notificationgroups",
                AddFields: {
                    PainterMobile: "",
                    PainterName: "",
                    PainterMembershipId: "",
                    PainterZone: "",
                    PainterDivision: "",
                    PainterDepot: ""
                },
                Rbtn: {
                    TarGrp: 0
                },
                MultiCombo: {
                    Zone: [],
                    Division: [],
                    Depot: [],
                    Members: [],
                    PainterType: [],
                    ArcheType: []
                },
                Search: {
                    PainterVh: {
                        ZoneId: "",
                        DivisionId: "",
                        DepotId: "",
                        PainterType: "",
                        ArcheType: "",
                        MembershipCard: "",
                        Name: "",
                        Mobile: ""
                    },
                    DepotVh: {
                        DepotId: "",
                        Division: ""
                    }
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
        _propertyToBlank: function (aArray, aModel2) {
            var aProp = aArray;
            var oView = this.getView();
            var oModelView = oView.getModel("oModelView");
            if (aModel2) {
                oModelView = oView.getModel("oModelControl");
            }
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

        _ValidateForm: function (mParam) {
            var oView = this.getView();
            var oValidate = new Validator();
            var othat = this;
            if (mParam === "Edit") {
                var oForm = oView.byId("ObjectPageLayoutEdit");
            } else {
                var oForm = oView.byId("ObjectPageLayout");
            }

            var bFlagValidate = oValidate.validate(oForm, true);
            if (!bFlagValidate) {
                othat._showMessageToast("Message3")
                return false;
            }
            return true;
        },
        _ValidateMembers: function () {

            var oView = this.getView();
            var oModelData = oView.getModel("oModelControl").getData();
            if (oModelData["Rbtn"]["TarGrp"] === 0) {
                if (oModelData["MultiCombo"]["Members"].length === 0) {
                    this._showMessageToast("Message10")
                    return false;
                }
            }
            return true;
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
            var aExistingMember = oModelView.getProperty("/Members" + sResults);
            var aSelectedMember = oModelControl.getProperty("/MultiCombo/Members")
            var iMembers = -1;
            var aMembers = [];
            for (var x of aSelectedMember) {
                iMembers = aExistingMember.findIndex(item => item["Id"] === x["Id"])
                if (iMembers >= 0) {
                    aMembers.push(aExistingMember[iMembers]);
                } else {
                    aMembers.push({ Id: x["Id"], RoleId:x["RoleId"] });
                }
                //aMembers.push({ Id: x["Id"] });
            }
            oPayload["Members"] = aMembers;
            // zone 
            var aExistingZone = oModelView.getProperty("/NotificationGroupZone" + sResults);
            var aSelectedMember = oModelControl.getProperty("/MultiCombo/Zone");
            var iZone = -1;
            var aZone = [];
            for (var x of aSelectedMember) {
                iZone = aExistingZone.findIndex(item => item["ZoneId"] === x)
                if (iZone >= 0) {

                    aZone.push(aExistingZone[iZone]);
                } else {
                    aZone.push({ ZoneId: x });
                }
            }
            oPayload["NotificationGroupZone"] = aZone;

            // Division
            var aExistingZone = oModelView.getProperty("/NotificationGroupDivision" + sResults);
            var aSelectedMember = oModelControl.getProperty("/MultiCombo/Division")
            var iZone = -1;
            var aZone = [];
            for (var x of aSelectedMember) {
                iZone = aExistingZone.findIndex(item => item["DivisionId"] === x)
                if (iZone >= 0) {

                    aZone.push(aExistingZone[iZone]);
                } else {
                    aZone.push({ DivisionId: x });
                }
            }
            oPayload["NotificationGroupDivision"] = aZone;

            // // Depot
            var aExistingZone = oModelView.getProperty("/NotificationGroupDepot" + sResults);
            var aSelectedMember = oModelControl.getProperty("/MultiCombo/Depot")
            var iZone = -1;
            var aZone = [];
            for (var x of aSelectedMember) {
                iZone = aExistingZone.findIndex(item => item["DepotId"] === x["DepotId"])
                if (iZone >= 0) {

                    aZone.push(aExistingZone[iZone]);
                } else {
                    aZone.push({ DepotId: x["DepotId"] });
                }
            }
            oPayload["NotificationGroupDepot"] = aZone;

            // // Painter Type 
            // var aExistingZone = oModelView.getProperty("/NotificationGroupPainterType" + sResults);
            // var aSelectedMember = oModelControl.getProperty("/MultiCombo/PainterType")
            // var iZone = -1;
            // var aZone = [];
            // for (var x of aSelectedMember) {
            //     iZone = aExistingZone.findIndex(item => item["PainterTypeId"] === parseInt(x))
            //     if (iZone >= 0) {

            //         aZone.push(oPayload["NotificationGroupPainterType"][iZone]);
            //     } else {
            //         aZone.push({ PainterTypeId: parseInt(x) });
            //     }
            // }
            // oPayload["NotificationGroupPainterType"] = aZone;
            // // ArcheType
            // var aExistingZone = oModelView.getProperty("/NotificationGroupPainterArcheType" + sResults);
            // var aSelectedMember = oModelControl.getProperty("/MultiCombo/ArcheType")
            // var iZone = -1;
            // var aZone = [];
            // for (var x of aSelectedMember) {
            //     iZone = aExistingZone.findIndex(item => item["PainterArcheTypeId"] === parseInt(x))
            //     if (iZone >= 0) {

            //         aZone.push(oPayload["NotificationGroupPainterArcheType"][iZone]);
            //     } else {
            //         aZone.push({ PainterArcheTypeId: parseInt(x) });
            //     }
            // }
            // oPayload["NotificationGroupPainterArcheType"] = aZone;
            promise.resolve(oPayload);
            return promise

        },
        _RemoveNavigationProp:function(oPayload){
            var promise = $.Deferred();
            console.log(oPayload,"inisde the remove navigation property method");
            for (var y of oPayload["Members"]){
                delete y["DGA"]
            }
            promise.resolve(oPayload);
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
        onRbChnageMain: function (oEvent) {
            this._propertyToBlank(["MultiCombo/Members", "MultiCombo/Zone", "MultiCombo/Division", "MultiCombo/Depot"], true);
            this.getView().getModel("oModelView").refresh(true);
            this.getView().getModel("oModelControl").refresh(true);
            this.getView().getModel("oModelDisplay").refresh(true);

            
        },
        // painter value help request
        onValueHelpRequestedPainter: function () {
            this._oMultiInput = this.getView().byId("multiInputPainterAdd");
            this.oColModel = new JSONModel({
                cols: [{
                    label: "Name",
                    template: "DGA/GivenName",
                },
                {
                    label: "Mobile",
                    template: "DGA/Mobile",
                },
                {
                    label: "Unique Id",
                    template: "DGA/UniqueId",
                },
                {
                    label: "Zone",
                    template: "DGA/Zone",
                },
                {
                    label: "Division",
                    template: "DGA/DivisionId",
                },
                {
                    label: "Depot",
                    template: "DGA/DepotId",
                },
                {
                    label: "Pincode",
                    template: "DGA/Pincode/Name",
                },
                {
                    label: "Payroll Company",
                    template: "DGA/PayrollCompany/Name",
                },
                {
                    label: "DGA Type",
                    template: "DGA/DGAType/Name",
                },
                {
                    label: "Status",
                    template: "DGA/ActivationStatus",
                }
                ],
            });

            var aCols = this.oColModel.getData().cols;
            var oFilter = new sap.ui.model.Filter({
                filters: [
                    new Filter("IsArchived", sap.ui.model.FilterOperator.EQ, false),
                    new Filter("DGAId", sap.ui.model.FilterOperator.GT, 0)
                ],
                and: true
            });

            this._oValueHelpDialog = sap.ui.xmlfragment(
                "com.knpl.dga.notificationgroups.view.fragments.PainterValueHelp",
                this
            );
            this.getView().addDependent(this._oValueHelpDialog);

            this._oValueHelpDialog.setBusy(true);

            this._oValueHelpDialog.getTableAsync().then(
                function (oTable) {
                    oTable.setModel(this.oColModel, "columns");

                    if (oTable.bindRows) {
                        oTable.bindAggregation("rows", {
                            path: "/ApplicationUsers",
                            filters: [oFilter],
                            parameters: {
                                expand: "DGA/DGAType,DGA/Division,DGA/Depot,DGA/Pincode,DGA/PayrollCompany"
                            },
                            events: {
                                dataReceived: function () {
                                    this._oValueHelpDialog.setBusy(false);
                                    this._oValueHelpDialog.update();

                                    // var update=this._oValueHelpDialog.update();
                                    // update.then(
                                    //     function(){
                                    //         debugger;
                                    //         this._oValueHelpDialog.setBusy(false)
                                    //     }

                                    // );

                                }.bind(this)
                            }
                        });
                    }

                    if (oTable.bindItems) {
                        oTable.bindAggregation("items", "/ApplicationUsers", function () {
                            return new sap.m.ColumnListItem({
                                cells: aCols.map(function (column) {
                                    return new sap.m.Label({
                                        text: "{" + column.template + "}",
                                    });
                                }),
                            });
                        });
                    }

                    this._oValueHelpDialog.update();
                }.bind(this)
            );

            // this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
            this._oValueHelpDialog.open();
        },


        onValueHelpCancelPressPainter: function () {
            this._oValueHelpDialog.close();
        },
        onValueHelpOkPressPainter2:function(){
            var oData = [];
            var xUnique = new Set();
            var aTokens = oEvent.getParameter("tokens");

            aTokens.forEach(function (ele) {
                if (xUnique.has(ele.getKey()) == false) {
                    oData.push({
                        DepotId: ele.getKey()
                    });
                    xUnique.add(ele.getKey());
                }
            });

            this.getView()
                .getModel("oModelControl")
                .setProperty("/MultiCombo/Depot", oData);
            this._oValueHelpDialog.close();
        },
        onValueHelpOkPressPainter: function (oEvent) {
            var oData = [];
            var xUnique = new Set();
            var oViewModel = this.getModel("oModelControl"),
                aData = oViewModel.getProperty("/MultiCombo/Members");
            var aTokens = oEvent.getParameter("tokens");
            if (aTokens && aTokens.length) {
                for (var i = 0; i < aTokens.length; i++) {
                    var userData = aTokens[i].getCustomData()[0].getValue();
                    console.log(userData);
                    // if (userData.AdminId !== null) {
                    //     var painterData = this.getModel().getData("/" + userData.Admin.__ref);

                    // }  
                    if (userData["DGA"] !== null) {
                        var painterData = this.getModel().getData("/" + userData["DGA"].__ref);
                    }
                    //var roleData = this.getModel().getData("/" + userData.Role.__ref);
                    userData["DGA"] = painterData;
                    //userData.Role.Role = roleData.Role;
                    aData.push(userData);
                }
            }
            var uniqueArray = this.removeDuplicates(aData, "Id");
            oViewModel.setProperty("/MultiCombo/Members", uniqueArray);
            console.log(oViewModel);
            oViewModel.refresh(true);



            this._oValueHelpDialog.close();
        },
        onValueHelpAfterClose: function () {

            if (this._oValueHelpDialog) {
                this._oValueHelpDialog.destroy();
                delete this._oValueHelpDialog;
            }

        },

        _filterTable: function (oFilter, sType) {
            var oValueHelpDialog = this._oValueHelpDialog;

            oValueHelpDialog.getTableAsync().then(function (oTable) {
                if (oTable.bindRows) {
                    oTable.getBinding("rows").filter(oFilter, sType || "Application");
                }

                if (oTable.bindItems) {
                    oTable
                        .getBinding("items")
                        .filter(oFilter, sType || "Application");
                }

                oValueHelpDialog.update();
            });
        },


        onFilterBarSearchPainter: function (oEvent) {
            var afilterBar = oEvent.getParameter("selectionSet");

            var aCurrentFilterValues = [];
            var oViewFilter = this.getView().getModel("oModelControl").getProperty("/Search/PainterVh");
            var aFlaEmpty = true;
            for (let prop in oViewFilter) {
                if (oViewFilter[prop]) {
                    if (prop === "ZoneId") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter("DGA/Zone", FilterOperator.EQ, oViewFilter[prop])
                        );
                    } else if (prop === "DivisionId") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter("DGA/DivisionId", FilterOperator.EQ, oViewFilter[prop])
                        );
                    } else if (prop === "DepotId") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter("DGA/DepotId", FilterOperator.EQ, oViewFilter[prop])
                        );
                    } else if (prop === "PayrollCompany") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter({
                                path: "DGA/PayrollCompanyId",
                                operator: FilterOperator.EQ,
                                value1: oViewFilter[prop]
                            })
                        );
                    } else if (prop === "DgaType") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter({
                                path: "DGA/DGATypeId",
                                operator: FilterOperator.EQ,
                                value1: oViewFilter[prop]
                            })
                        );
                    } else if (prop === "Status") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter({
                                path: "DGA/ActivationStatus",
                                operator: FilterOperator.EQ,
                                value1: oViewFilter[prop]
                            })
                        );
                    } else if (prop === "Name") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter({
                                path: "DGA/GivenName",
                                operator: FilterOperator.Contains,
                                value1: oViewFilter[prop],
                                caseSensitive: false
                            })
                        );
                    } else if (prop === "Mobile") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter({
                                path: "DGA/Mobile",
                                operator: FilterOperator.Contains,
                                value1: oViewFilter[prop]
                            })
                        );
                    }else if (prop === "Search") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter(
                                [
                                    new Filter({
                                        path: "DGA/GivenName",
                                        operator: "Contains",
                                        value1: oViewFilter[prop].trim(),
                                        caseSensitive: false
                                    }),
                                    new Filter({
                                        path: "DGA/Mobile",
                                        operator: "Contains",
                                        value1: oViewFilter[prop].trim(),
                                        caseSensitive: false
                                    }),
                                    new Filter({
                                        path: "DGA/UniqueId",
                                        operator: "Contains",
                                        value1: oViewFilter[prop].trim(),
                                        caseSensitive: false
                                    }),
                                    new Filter({
                                        path: "DGA/Pincode/Name",
                                        operator: "Contains",
                                        value1: oViewFilter[prop].trim(),
                                        caseSensitive: false
                                    })
                                ],
                                false
                            )
                        );
                    }
                }
            }

            this._FilterPainterValueTable(
                new Filter({
                    filters: aCurrentFilterValues,
                    and: true,
                })
            );
        },
        _FilterPainterValueTable: function (oFilter, sType) {
            var oValueHelpDialog = this._oValueHelpDialog;

            oValueHelpDialog.getTableAsync().then(function (oTable) {
                if (oTable.bindRows) {
                    oTable.getBinding("rows").filter(oFilter, sType || "ApplicatApplication");
                }

                if (oTable.bindItems) {
                    oTable
                        .getBinding("items")
                        .filter(oFilter, sType || "Application");
                }

                oValueHelpDialog.update();
            });
        },

        removeDuplicates: function (originalArray, prop) {
            var newArray = [];
            var lookupObject = {};

            for (var i in originalArray) {
                lookupObject[originalArray[i][prop]] = originalArray[i];
            }

            for (i in lookupObject) {
                newArray.push(lookupObject[i]);
            }
            return newArray;
        },
        onDeleteMember: function (oEvent) {
            var oViewModel = this.getModel("oModelControl"),
                iIndex = +(oEvent.getParameter("listItem").getBindingContext("oModelControl").sPath.match(/\d+/)[0]);
            oViewModel.getProperty("/MultiCombo/Members").splice(iIndex, 1);
            oViewModel.refresh();
        },
        onPVhZoneChange: function (oEvent) {
            var sId = oEvent.getSource().getSelectedKey();
            var oView = this.getView();

            var oDivision = sap.ui.getCore().byId("idPVhDivision");
            var oDivItems = oDivision.getBinding("items");
            var oDivSelItm = oDivision.getSelectedItem(); //.getBindingContext().getObject()
            oDivision.clearSelection();
            oDivision.setValue("");
            oDivItems.filter(new Filter("Zone", FilterOperator.EQ, sId));
            //setting the data for depot;
            var oDepot = sap.ui.getCore().byId("idPVhDepot");
            oDepot.clearSelection();
            oDepot.setValue("");
            // clearning data for dealer
        },
        onPVhDivisionChange: function (oEvent) {
            var sKey = oEvent.getSource().getSelectedKey();
            var oView = this.getView();
            var oDepot = sap.ui.getCore().byId("idPVhDepot");
            var oDepBindItems = oDepot.getBinding("items");
            oDepot.clearSelection();
            oDepot.setValue("");
            oDepBindItems.filter(new Filter("Division", FilterOperator.EQ, sKey));
        },
        onClearPainterVhSearch: function () {
            var oView = this.getView();
            var oModel = oView.getModel("oModelControl"),
                aCurrentFilterValues = [];
            oModel.setProperty("/Search/PainterVh", {
                ZoneId: "",
                DivisionId: "",
                DepotId: "",
                Search:"",
                PayrollCompany:"",
                DgaType:"",
                Status:""
            });
            aCurrentFilterValues.push(new Filter({
                path: "IsArchived",
                operator: FilterOperator.EQ,
                value1: false
            }));

            this._FilterPainterValueTable(
                new Filter({
                    filters: aCurrentFilterValues,
                    and: true,
                })
            );
        },
        onMultyZoneChange: function (oEvent) {
            var sKeys = oEvent.getSource().getSelectedKeys();
            var oDivision = this.getView().byId("idDivision");

            this._fnChangeDivDepot({
                src: {
                    path: "/MultiCombo/Zones"
                },
                target: {
                    localPath: "/MultiCombo/Division",
                    oDataPath: "/MasterDivisions",
                    key: "Zone"
                }
            });

            this._fnChangeDivDepot({
                src: {
                    path: "/MultiCombo/Zones"
                },
                target: {
                    localPath: "/MultiCombo/Depot",
                    oDataPath: "/MasterDepots",
                    key: "Division",
                    targetKey: "DepotId"
                }
            });

            var aDivFilter = [];
            for (var y of sKeys) {
                aDivFilter.push(new Filter("Zone", FilterOperator.EQ, y))
            }
            oDivision.getBinding("items").filter(aDivFilter);
        },

        onMultyDivisionChange: function (oEvent) {

            this._fnChangeDivDepot({
                src: {
                    path: "/MultiCombo/Division"
                },
                target: {
                    localPath: "/MultiCombo/Depot",
                    oDataPath: "/MasterDepots",
                    key: "Division",
                    targetKey: "DepotId"
                }
            });
        },
        _fnChangeDivDepot: function (oChgdetl) {

            var aTarget = this.getModel("oModelControl").getProperty(oChgdetl.target.localPath),
                aNewTarget = [];

            var aSource = this.getModel("oModelControl").getProperty(oChgdetl.src.path),
                oSourceSet = new Set(aSource);



            var oModel = this.getModel(),
                tempPath, tempdata;

            aTarget.forEach(function (ele) {
                if (typeof ele === "string") {
                    tempPath = oModel.createKey(oChgdetl.target.oDataPath, {
                        Id: ele
                    });
                } else {
                    tempPath = oModel.createKey(oChgdetl.target.oDataPath, {
                        Id: ele[oChgdetl.target.targetKey]
                    });
                }
                tempdata = oModel.getData(tempPath);
                if (oSourceSet.has(tempdata[oChgdetl.target.key])) {
                    aNewTarget.push(ele)
                }
            });

            this.getModel("oModelControl").setProperty(oChgdetl.target.localPath, aNewTarget);
        },
        onValueHelpRequestedDepot: function () {
            this._oMultiInput = this.getView().byId("multiInputDepotAdd");
            this.oColModel = new JSONModel({
                cols: [{
                    label: "Depot Id",
                    template: "Id",
                    width: "10rem",
                },
                {
                    label: "Depot",
                    template: "Depot",
                }
                ],
            });

            var aCols = this.oColModel.getData().cols;

            this._oValueHelpDialog = sap.ui.xmlfragment(
                "com.knpl.dga.notificationgroups.view.fragments.DepotValueHelp",
                this
            );
            var oDataFilter = {
                Id: "",
                Depot: "",
            }
            var oModel = new JSONModel(oDataFilter);
            this.getView().setModel(oModel, "DepotFilter");

            this.getView().addDependent(this._oValueHelpDialog);

            this._oValueHelpDialog.getTableAsync().then(
                function (oTable) {
                    oTable.setModel(this.oColModel, "columns");

                    if (oTable.bindRows) {
                        oTable.bindAggregation("rows", {
                            path: "/MasterDepots",
                            events: {
                                dataReceived: function () {
                                    this._oValueHelpDialog.update();
                                }.bind(this)
                            }
                        });
                    }

                    if (oTable.bindItems) {
                        oTable.bindAggregation("items", "/MasterDepots", function () {
                            return new sap.m.ColumnListItem({
                                cells: aCols.map(function (column) {
                                    return new sap.m.Label({
                                        text: "{" + column.template + "}",
                                    });
                                }),
                            });
                        });
                    }

                    this._oValueHelpDialog.update();
                }.bind(this)
            );

            this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
            this._oValueHelpDialog.open();
        },
        onFilterBarSearch: function (oEvent) {
            var afilterBar = oEvent.getParameter("selectionSet"),
                aFilters = [];

            aFilters.push(
                new Filter({
                    path: "Id",
                    operator: FilterOperator.Contains,
                    value1: afilterBar[0].getValue(),
                    caseSensitive: false,
                })
            );
            aFilters.push(
                new Filter({
                    path: "Depot",
                    operator: FilterOperator.Contains,
                    value1: afilterBar[1].getValue(),
                    caseSensitive: false,
                })
            );

            this._filterTable(
                new Filter({
                    filters: aFilters,
                    and: true,
                })
            );
        },
        onValueHelpAfterOpen: function () {
            var aFilter = this._getfilterforControl();

            this._filterTable(aFilter, "Control");
            this._oValueHelpDialog.update();
        },
        _getfilterforControl: function () {
            var sDivision = this.getView().getModel("oModelControl").getProperty("/MultiCombo/Division");
            var aFilters = [];
            if (sDivision) {
                for (var y of sDivision) {
                    aFilters.push(new Filter("Division", FilterOperator.EQ, y));
                }
            }
            if (aFilters.length == 0) {
                return [];
            }

            return new Filter({
                filters: aFilters,
                and: false,
            });
        },
        onValueHelpCancelPress: function () {
            this._oValueHelpDialog.close();
        },
        onValueHelpOkPress: function (oEvent) {
            var oData = [];
            var xUnique = new Set();
            var aTokens = oEvent.getParameter("tokens");

            aTokens.forEach(function (ele) {
                if (xUnique.has(ele.getKey()) == false) {
                    oData.push({
                        DepotId: ele.getKey()
                    });
                    xUnique.add(ele.getKey());
                }
            });

            this.getView()
                .getModel("oModelControl")
                .setProperty("/MultiCombo/Depot", oData);
            this._oValueHelpDialog.close();
        },


    });

});