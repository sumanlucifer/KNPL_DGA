sap.ui.define([], function () {
    "use strict";
    var wfIcons = {
        WORKFLOW_STARTED: "sap-icon://initiative",
        WORKFLOW_COMPLETED: "sap-icon://stop",
        WORKFLOW_CANCELED: "sap-icon://sys-cancel-2",
        WORKFLOW_SUSPENDED: "sap-icon://media-pause",
        WORKFLOW_CONTINUED: "sap-icon://redo",
        WORKFLOW_RESUMED: "sap-icon://media-play",
        WORKFLOW_CONTEXT_OVERWRITTEN_BY_ADMIN: "sap-icon://user-edit",
        WORKFLOW_CONTEXT_PATCHED_BY_ADMIN: "sap-icon://user-edit",
        USERTASK_CREATED: "sap-icon://activity-individual",
        USERTASK_CLAIMED: "sap-icon://activity-individual",
        USERTASK_RELEASED: "sap-icon://activity-individual",
        USERTASK_CANCELED_BY_BOUNDARY_EVENT: "sap-icon://lateness",
        USERTASK_COMPLETED: "sap-icon://activity-2",
        USERTASK_FAILED: "sap-icon://activity-individual",
        USERTASK_PATCHED_BY_ADMIN: "sap-icon://activity-individual",
        SERVICETASK_CREATED: "sap-icon://settings",
        SERVICETASK_COMPLETED: "sap-icon://settings",
        SERVICETASK_FAILED: "sap-icon://settings",
        SCRIPTTASK_CREATED: "sap-icon://activities",
        SCRIPTTASK_COMPLETED: "sap-icon://activities",
        SCRIPTTASK_FAILED: "sap-icon://activities",
        INTERMEDIATE_MESSAGE_EVENT_REACHED: "sap-icon://message-popup",
        INTERMEDIATE_MESSAGE_EVENT_TRIGGERED: "sap-icon://message-popup",
        CANCELING_BOUNDARY_TIMER_EVENT_TRIGGERED: "sap-icon://circle-task",
        NONCANCELING_BOUNDARY_TIMER_EVENT_TRIGGERED: "sap-icon://mirrored-task-circle",
        INTERMEDIATE_TIMER_EVENT_REACHED: "sap-icon://fob-watch",
        INTERMEDIATE_TIMER_EVENT_TRIGGERED: "sap-icon://fob-watch",
        MAILTASK_CREATED: "sap-icon://email",
        MAILTASK_COMPLETED: "sap-icon://email",
        MAILTASK_FAILED: "sap-icon://email",
        PARALLEL_GATEWAY_REACHED: "sap-icon://combine",
        PARALLEL_GATEWAY_FAILED: "sap-icon://combine",
        EXCLUSIVE_GATEWAY_REACHED: "sap-icon://split",
        EXCLUSIVE_GATEWAY_FAILED: "sap-icon://split",
        REFERENCED_SUBFLOW_STARTED: "sap-icon://process",
        REFERENCED_SUBFLOW_COMPLETED: "sap-icon://process",
        REFERENCED_SUBFLOW_FAILED: "sap-icon://process"
    }

    return {

        /**
         * Rounds the number unit value to 2 digits
         * @public
         * @param {string} sValue the number string to be rounded
         * @returns {string} sValue with 2 digits rounded
         */
        fmtLowerCase: function (mParam) {
            if(!mParam){
                return 
            }
            var sStatus = "";

            if (mParam.split("_").length > 1) {
                var mArray = mParam.split("_");

            } else {
                var mArray = mParam.split(" ");

            }
            for (var x of mArray) {
                var a = x.toLowerCase() + " ";
                var b = a[0].toUpperCase() + a.slice(1);

                sStatus += b;
            }
            return sStatus;
        },
        fmtCheckNull: function (mParam1) {
            if (!mParam1) {
                return "NA"
            }
            return mParam1;
        },
        fmtGenerateImageUrl: function (mMetadata) {
            // mMetadata (string) is required from the odata responce "__metadata"
            if (mMetadata) {
                if (mMetadata.media_src) {
                    return "https://".concat(
                        location.host,
                        "/KNPL_PAINTER_API",
                        new URL(mMetadata.media_src).pathname
                    );
                }
            }

            return "";

        },
        fmtStatusColorChange: function (mParam) {
            if (mParam === "APPROVED") {
                return "Success";
            }
            if (mParam === "PUBLISHED") {
                return "Success";
            }
            if (mParam === "PENDING") {
                return "Warning";
            }
            return "Error";
        },
    };

});