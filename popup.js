angular.module('localstorageSaverApp', [])
    .controller('PopupController', function($scope) {

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {}, function(response) {
                var lS = response.localStorage,
                    sS = response.sessionStorage,
                    storageMax =  1024 * 1024 * 5;

                $scope.sessionStorageUsed = (JSON.stringify(sS).length / storageMax) * 100;
                $scope.localStorageUsed   = (JSON.stringify(lS).length / storageMax) * 100;
                $scope.$apply();
            });
        });

        $scope.savedStates = [
            // {
            //     label: 'ppg'
            // },
            // {
            //     label: 'test 2'
            // }
        ];

    });
