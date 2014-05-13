//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.

define([], function(){

    var zipIframeLoader = function(ReadiumSDK, getCurrentResourceFetcher) {

        var basicIframeLoader = new ReadiumSDK.Views.IFrameLoader();

        this.addIFrameEventListener = function(eventName, callback, context, options) {
            basicIframeLoader.addIFrameEventListener(eventName, callback, context, options);
        };

        this.loadIframe = function(iframe, src, callback, caller, attachedData) {

            var shouldFetchProgrammatically = getCurrentResourceFetcher().shouldFetchProgrammatically();
            if (shouldFetchProgrammatically) {
                var basicLoadCallback = function (success) {
                    getCurrentResourceFetcher().fetchContentDocument(attachedData,
                        function (resolvedContentDocumentDom) {
                            var contentDocument = iframe.contentDocument;
                            contentDocument.replaceChild(resolvedContentDocumentDom.documentElement,
                                contentDocument.documentElement);
                            callback.call(caller, success, attachedData);
                        }, function (err) {
                            callback.call(caller, success, attachedData);
                        }
                    );
                };
                // Feed an artificial empty HTML document to the IFRAME, then let the wrapper onload function
                // take care of actual document loading (from zipped EPUB) and calling callbacks:
                var emptyDocumentDataUri = window.URL.createObjectURL(
                    new Blob(['<html><body></body></html>'], {'type': 'text/html'})
                );

                basicIframeLoader.loadIframe(iframe, emptyDocumentDataUri, basicLoadCallback, caller, attachedData);
            } else {
                basicIframeLoader.loadIframe(iframe, src, callback, caller, attachedData);
            }
        };
    };

    return zipIframeLoader;
});
