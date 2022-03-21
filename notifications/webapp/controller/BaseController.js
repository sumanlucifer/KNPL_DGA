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

    return Controller.extend("com.knpl.dga.notifications.controller.BaseController", {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         * This module is used as a template for creating other modules in the KNPL Dga Applications
         * for creating the module kindly replate the following 
         * 1. com.knpl.dga.notifications
         * 2. com/knpl/dga/notifications - used in test folder for flp config
         * 3. com-knpl-dga-notifications - used in the manifest
         * 4  comknpldganotifications - used in test folder for flp config
         */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },
        _dummyPromise: function (oPayload) {
            var promise = $.Deferred();
            promise.resolve(oPayload)
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
                ComplainId: mParam2,
                bindProp: "NotificationSet(" + mParam2 + ")",
                resourcePath: "com.knpl.dga.notifications",
                MultiCombo: {
                    Receivers: []
                },
                currDate: new Date()
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
            var bFlagValidate = oValidate.validate(oForm,true);
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
        onRedirectionChange: function () {
            var oView = this.getView();
            var oModelView = oView.getModel("oModelView");
            oModelView.setProperty("/RedirectionTo", "");
        },
        onSwitch1Change: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");
            var oModelView = oView.getModel("oModelView");
            oModelControl.setProperty("/MultiCombo/Receivers", []);
            oModelView.setProperty("/GroupId","")
        },
        onSwitch2Change: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");
            var oModelView = oView.getModel("oModelView");
            // ScheduledDate:null,
            // ScheduledTime:null,
            oModelView.setProperty("/ScheduledDate",null);
            oModelView.setProperty("/ScheduledTime",null);
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
                "GroupId",
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
        _AddMultiComboData: function (oPayload) {
            var promise = $.Deferred();
            var oView = this.getView();
            var oModelView = oView.getModel("oModelView");
            var oModelControl = oView.getModel("oModelControl");
            // Receivers/Painters Combobox - 
            var aExistingDealers = oModelView.getProperty("/Receivers");
            var aSelectedDealers = oModelControl.getProperty("/MultiCombo/Receivers")
            var iDealers = -1;
            var aDealers = [];
            for (var x of aSelectedDealers) {
                iDealers = aExistingDealers.findIndex(item => parseInt(item["Id"]) === parseInt(x["Id"]) )
                if (iDealers >= 0) {
                    //oPayload["PainterExpertise"][iExpIndex]["IsArchived"] = false;
                    aDealers.push(oPayload["Receivers"][iDealers]);
                } else {
                    aDealers.push({ Id: parseInt(x["Id"]) });
                }
            }
            oPayload["Receivers"] = aDealers;
            promise.resolve(oPayload);
            return promise

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
        // painter value help request

        onValueHelpRequestedPainter: function () {
            this._oMultiInput = this.getView().byId("multiInputPainterAdd");
            this.oColModel = new JSONModel({
                cols: [
                    {
                        label: "Membership ID",
                        template: "Painter/MembershipCard",
                    },
                    {
                        label: "Name",
                        template: "Painter/Name",
                    },
                    {
                        label: "Mobile Number",
                        template: "Painter/Mobile",
                    },
                    {
                        label: "Zone",
                        template: "Painter/ZoneId",
                    },
                    {
                        label: "Division",
                        template: "Painter/DivisionId",
                    },
                    {
                        label: "Depot",
                        template: "Painter/Depot/Depot",
                    },
                    {
                        label: "Painter Type",
                        template: "Painter/PainterType/PainterType",
                    },
                    {
                        label: "Painter ArcheType",
                        template: "Painter/ArcheType/ArcheType",
                    }
                ],
            });

            var aCols = this.oColModel.getData().cols;
            var oFilter = new sap.ui.model.Filter({
                filters: [
                    new Filter("IsArchived", sap.ui.model.FilterOperator.EQ, false),
                    new Filter("PainterId", sap.ui.model.FilterOperator.GT, 0)
                ], and: true
            });

            this._oValueHelpDialog = sap.ui.xmlfragment(
                "com.knpl.dga.notifications.view.fragments.PainterValueHelp",
                this
            );
            this.getView().addDependent(this._oValueHelpDialog);

            this._oValueHelpDialog.getTableAsync().then(
                function (oTable) {
                    oTable.setModel(this.oColModel, "columns");

                    if (oTable.bindRows) {
                        oTable.bindAggregation("rows", {
                            path: "/UserSet", filters: [oFilter], parameters: { expand: "Painter,Painter/Depot,Painter/Division,Painter/ArcheType,Painter/PainterType" }, events:
                            {
                                dataReceived: function () {
                                    this._oValueHelpDialog.update();
                                }.bind(this)
                            }
                        });
                    }

                    if (oTable.bindItems) {
                        oTable.bindAggregation("items", "/UserSet", function () {
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



        onValueHelpCancelPressPainter: function () {
            this._oValueHelpDialog.close();
        },

        onValueHelpOkPressPainter: function (oEvent) {
            var oData = [];
            var xUnique = new Set();
            var aTokens = oEvent.getParameter("tokens");

            aTokens.forEach(function (ele) {
                if (xUnique.has(ele.getKey()) == false) {
                    oData.push({
                        PainterName: ele.getText(),
                        //PainterId: ele.getKey(),
                        Id: ele.getKey()
                    });
                    xUnique.add(ele.getKey());
                }
            });

            this.getView().getModel("oModelControl").setProperty("/MultiCombo/Receivers", oData);
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
                            new Filter("Painter/ZoneId", FilterOperator.EQ, oViewFilter[prop])
                        );
                    } else if (prop === "DivisionId") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter("Painter/DivisionId", FilterOperator.EQ, oViewFilter[prop])
                        );
                    } else if (prop === "DepotId") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter("Painter/DepotId", FilterOperator.EQ, oViewFilter[prop])
                        );
                    } else if (prop === "PainterType") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter({ path: "Painter/PainterTypeId", operator: FilterOperator.EQ, value1: oViewFilter[prop] })
                        );
                    } else if (prop === "ArcheType") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter({ path: "Painter/ArcheTypeId", operator: FilterOperator.EQ, value1: oViewFilter[prop] })
                        );
                    } else if (prop === "MembershipCard") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter({ path: "Painter/MembershipCard", operator: FilterOperator.Contains, value1: oViewFilter[prop], caseSensitive: false })
                        );
                    } else if (prop === "Name") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter({ path: "Painter/Name", operator: FilterOperator.Contains, value1: oViewFilter[prop], caseSensitive: false })
                        );
                    } else if (prop === "Mobile") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter({ path: "Painter/Mobile", operator: FilterOperator.Contains, value1: oViewFilter[prop] })
                        );
                    }
                }
            }

            // aCurrentFilterValues.push(new Filter({
            //     path: "IsArchived",
            //     operator: FilterOperator.EQ,
            //     value1: false
            // }))


            if (aCurrentFilterValues.length > 0) {
                this._FilterPainterValueTable(
                    new Filter({
                        filters: aCurrentFilterValues,
                        and: true,
                    })
                );
            }
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
            var oModel = oView.getModel("oModelControl"), aCurrentFilterValues = [];
            oModel.setProperty("/Search/PainterVh", {
                ZoneId: "",
                DivisionId: "",
                DepotId: "",
                PainterType: "",
                ArcheType: "",
                MembershipCard: "",
                Name: "",
                Mobile: ""
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

    });

});