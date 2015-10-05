angular.module('localstorageSaverApp', [])
    .controller('PopupController', function($scope) {

        $scope.savedStates = [];
        $scope.hostname = '';

        var reloadStorageStates = function() {
            chrome.storage.local.get(null, function (items) {
                allSites = items['sites'] || {};
                var currentSite = allSites[$scope.hostname] || {};
                var keys = Object.keys(currentSite);
                $scope.savedStates = []; // reset

                keys.forEach(function(key) {
                    $scope.savedStates.push({
                        label: currentSite[key].label,
                        internalID: key
                    });
                })

                $scope.$apply();
            });
        }

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {}, function(response) {
                var lS = response.localStorage,
                    sS = response.sessionStorage,
                    storageMax = 1024 * 1024 * 5;

                $scope.hostname = response.hostname;
                $scope.sessionStorageUsed = (JSON.stringify(sS).length / storageMax) * 100;
                $scope.localStorageUsed   = (JSON.stringify(lS).length / storageMax) * 100;

                reloadStorageStates();
                $scope.$apply();
            });
        });

        $scope.clearStorage = function() {
            chrome.storage.local.clear();
        };

        $scope.deleteState = function(internalID) {
            chrome.storage.local.get(null, function (items) {
                allSites = items['sites'] || {};
                var currentSite = allSites[$scope.hostname] || {},
                    keys = Object.keys(currentSite);

                keys.forEach(function(key) {
                    if (key == internalID) {
                        delete currentSite[key];
                    }
                })

                allSites[$scope.hostname] = currentSite;
                items['sites'] = allSites;

                chrome.storage.local.set(items, function() {
                    reloadStorageStates();
                    if (chrome.runtime.error) {
                        console.log("Runtime error.");
                    }
                });
            });

        };

        $scope.promptRename = function() {
            this.state.renaming = true;
        };

        $scope.rename = function() {
            if (event.keyCode != 13) {
                return;
            }

            var newLabel = this.state.edited_label,
                internalID = this.state.internalID;

            this.state.renaming = false;
            this.state.label = newLabel;

            chrome.storage.local.get(null, function (items) {
                allSites = items['sites'] || {};
                var currentSite = allSites[$scope.hostname] || {},
                 keys = Object.keys(currentSite);

                keys.forEach(function(key) {
                    if (key == internalID) {
                        currentSite[key].label = newLabel;
                    }
                })

                allSites[$scope.hostname] = currentSite;
                items['sites'] = allSites;

                chrome.storage.local.set(items, function() {
                    reloadStorageStates();
                    if (chrome.runtime.error) {
                        console.log("Runtime error.");
                    }
                });
            });
        };

        $scope.apply = function() {
            var state = this.state;
            chrome.storage.local.get(null, function (items) {
                allSites = items['sites'] || {};
                var currentSite = allSites[$scope.hostname] || {},
                    keys = Object.keys(currentSite),
                    toApply = undefined;

                keys.forEach(function(key) {
                    if (key == state.internalID) {
                        toApply = currentSite[key];
                    }
                });

                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    var args = {
                        apply: true,
                        state: {
                            localStorage: toApply.localStorage,
                            sessionStorage: toApply.sessionStorage
                        }
                    };

                    chrome.tabs.sendMessage(tabs[0].id, args, function(response) {

                    });
                });
            });
        }

        $scope.saveStorageState = function() {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {}, function(response) {
                    var lS = response.localStorage,
                        sS = response.sessionStorage,
                        hostname = response.hostname,
                        internalID = new Date().getTime();

                    $scope.savedStates.push({
                        label: internalID,
                        internalID: internalID
                    });

                    $scope.$apply();

                    // get contents of all storage
                    chrome.storage.local.get(null, function (items) {
                        allSites = items['sites'] || {};
                        var currentSite = allSites[hostname] || {};

                        currentSite[internalID] = {
                            localStorage: lS,
                            sessionStorage: sS,
                            label: internalID
                        };

                        allSites[hostname] = currentSite;
                        items['sites'] = allSites;

                        chrome.storage.local.set(items, function() {
                            if (chrome.runtime.error) {
                                console.log("Runtime error.");
                            }
                        });
                    });
                });
            });
        }
    });
