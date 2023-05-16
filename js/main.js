var app = angular.module("App", ["ngSanitize", "ngRoute"])
        .config(function ($routeProvider) {
                $routeProvider
                        .when("/", {
                                templateUrl: "pages/home.html",
                                controller: "CtrlApp"
                        })
                        .when("/Order", {
                                templateUrl: "pages/order.html",
                                controller: "CtrlApp"
                        })
                        .when("/CheckOut", {
                                templateUrl: "pages/checkout.html",
                                controller: "CtrlApp",
                        })
                        .when("/Login", {
                                templateUrl: "pages/login.html",
                                controller: "CtrlApp",
                        })
                        .when("/History", {
                                templateUrl: "pages/history.html",
                                controller: "CtrlApp"
                        })
                        .when("/Sitemap", {
                                templateUrl: "pages/sitemap.html",
                                controller: "CtrlApp"
                        })
        })
        .controller("CtrlApp", function ($scope, $http, $sce, $location, $route, $window) {
                $http.get('./data/faq.json').then(function (response) {
                        $scope.faq = response.data;
                });
                $http.get('./data/product.json').then(function (response) {
                        $scope.product = response.data;
                        $scope.brands = [...new Set($scope.product.map((obj) => obj.brand))]
                        $scope.colors = [...new Set($scope.product.map((obj) => obj.color))]
                        $scope.categories = [...new Set($scope.product.map((obj) => obj.category))]
                        $scope.starOn = function (num, html = "") {
                                if (num == 0) {
                                        return html
                                }
                                html += `<i class="fs-6 fa fa-star rating-color"></i>`
                                return $scope.starOn(num - 1, html)
                        }
                        $scope.starOff = function (num, html = "") {
                                if (num == 0) {
                                        return html
                                }
                                html += `<i class="fs-6 fa fa-star"></i>`
                                return $scope.starOff(num - 1, html)
                        }
                        $scope.ratings = $scope.product.map((obj) => $scope.starOn(obj.rating) + $scope.starOff(5 - obj.rating))
                        $scope.getIndex = (obj) => $scope.product.indexOf(obj)
                });
                $scope.buyCart = []
                $scope.renderHtml = function (htmlCode) {
                        return $sce.trustAsHtml(htmlCode);
                }
                $scope.checkProduct = function (num) {
                        console.log(num)
                }
                $scope.changeValue = function (event, obj = "") {
                        if (event.target.classList.contains("btn")) {
                                value = event.target.previousElementSibling.querySelector(".value")
                                if (value.innerText != "0") {
                                        data = $scope.DataBuyCart(obj, value.innerText)
                                        if (!localStorage.getItem("dataProductClient")) {

                                                localStorage.setItem("dataProductClient", JSON.stringify([data]))
                                        }
                                        else {
                                                json = JSON.parse(localStorage.getItem("dataProductClient"))
                                                if (json.some((item) => item.id == data.id)) {
                                                        json.filter((obj) => obj.id === data.id)[0].quantity = Number(json.filter((obj) => obj.id === data.id)[0].quantity) + Number(data.quantity)
                                                        localStorage.setItem("dataProductClient", JSON.stringify(json))
                                                }
                                                else {
                                                        json.push(data)
                                                        localStorage.setItem("dataProductClient", JSON.stringify(json))
                                                }
                                        }
                                        value.innerText = 0
                                }
                                return
                        }
                        value = event.target.parentElement.querySelector(".value")
                        if (obj != "") {
                                if (event.target.classList.contains("fa-minus")) {
                                        if (obj.quantity != "0") {
                                                obj.quantity = Number(obj.quantity) - 1
                                                localStorage.setItem("dataProductClient", JSON.stringify($scope.buyCart))
                                                $scope.total = $scope.getTotal($scope.buyCart)
                                        }
                                }
                                else {
                                        obj.quantity = Number(obj.quantity) + 1
                                        localStorage.setItem("dataProductClient", JSON.stringify($scope.buyCart))
                                        $scope.total = $scope.getTotal($scope.buyCart)
                                }
                        }
                        else {
                                if (event.target.classList.contains("fa-minus")) {
                                        if (value.innerText != "0") {
                                                value.innerText = Number(value.innerText) - 1
                                        }
                                }
                                else {
                                        value.innerText = Number(value.innerText) + 1
                                }
                        }
                }
                $scope.DataBuyCart = (obj, quantity) => {
                        return { ...obj, quantity: quantity }
                }
                $scope.check = true
                $scope.checkBuyCart = function () {
                        $scope.check = !$scope.buyCart.length ? true : false
                }
                $scope.runDataBuyCart = function () {
                        $scope.buyCart = JSON.parse(localStorage.getItem("dataProductClient"))
                        $scope.checkBuyCart()
                        $scope.total = $scope.getTotal($scope.buyCart)
                }
                $scope.deleteProductBuyCart = function (obj) {
                        $scope.buyCart.splice($scope.buyCart.indexOf(obj), 1)
                        localStorage.setItem("dataProductClient", JSON.stringify($scope.buyCart))
                        $scope.checkBuyCart()
                        $scope.total = $scope.getTotal($scope.buyCart)
                }
                $scope.getTotal = function (listProduct) {
                        return listProduct.reduce((prev, product) => prev + product.price * product.quantity, 0)
                }


                $scope.objFilter = {}
                $scope.checkFilter = {}
                $scope.clickAddFilter = function (key, value) {
                        if (key in $scope.objFilter) {
                                if ($scope.objFilter[key].includes(value)) {
                                        $scope.objFilter[key].splice($scope.objFilter[key].indexOf(value), 1)
                                }
                                else {
                                        $scope.objFilter[key].push(value)
                                }
                        }
                        else {
                                $scope.objFilter[key] = [value]
                        }
                }
                $scope.resetFilter = function () {
                        $scope.objFilter = Object.keys($scope.objFilter).reduce((accumulator, value) => {
                                return { ...accumulator, [value]: [] };
                        }, {})
                        document.querySelectorAll(".btn-custom-clicked").forEach((item) => item.classList.remove("btn-custom-clicked"))
                }
                $scope.myFilter = function (item) {
                        for (var key in $scope.objFilter) {
                                $scope.checkFilter[key] = false
                        }
                        if ($scope.objFilter) {
                                for (var key in $scope.objFilter) {
                                        if (!$scope.checkFilter[key]) {
                                                if ($scope.objFilter[key].length != 0) {
                                                        for (const itemArr of $scope.objFilter[key]) {
                                                                if (key === 'price' && !$scope.checkFilter[key]) {
                                                                        prices = itemArr.split(" ")
                                                                        $scope.checkFilter[key] = (item[key] >= Number(prices[0]) && item[key] <= Number(prices[1])) ? true : false
                                                                }
                                                                else if (key === 'rating') {
                                                                        $scope.checkFilter[key] = item[key] >= itemArr ? true : false
                                                                }
                                                                else if (itemArr === item[key]) {
                                                                        $scope.checkFilter[key] = true
                                                                }
                                                        }
                                                }
                                                else {
                                                        $scope.checkFilter[key] = true
                                                }
                                        }
                                }
                        }
                        if (Object.values($scope.objFilter).every((check) => check == "")) {
                                return true
                        }
                        else {
                                if (Object.values($scope.checkFilter).every((check) => check === true)) {
                                        return true
                                }
                                else {
                                        return false
                                }
                        }
                };
                $scope.getOrderBy = function (order, reverse) {
                        $scope.myOrderBy = order
                        $scope.reverseOrderBy = reverse
                }
                $scope.getDataContact = function ($event) {
                        dataCustomer = []
                        for (const item of $("#Contact")[0].querySelectorAll("input")) {
                                dataCustomer.push(item.value.trim())
                        }
                        dataCustomer.push($("#Contact")[0].querySelector("textarea").value.trim())
                        if (dataCustomer.every((item) => item)) {
                                dataPush = {
                                        name: dataCustomer[0],
                                        sdt: dataCustomer[1],
                                        email: dataCustomer[2],
                                        msg: dataCustomer[3],
                                }
                                if (!localStorage.getItem("feedbackDataCustomer")) {
                                        localStorage.setItem("feedbackDataCustomer", JSON.stringify([dataPush]))
                                        for (const item of $("#Contact")[0].querySelectorAll("input")) {
                                                item.value = ""
                                        }
                                        $("#Contact")[0].querySelector("textarea").value = ""
                                        $event.preventDefault()
                                }
                                else {
                                        dataLocal = JSON.parse(localStorage.getItem("feedbackDataCustomer"))
                                        dataLocal.push(dataPush)
                                        localStorage.setItem("feedbackDataCustomer", JSON.stringify(dataLocal))
                                        for (const item of $("#Contact")[0].querySelectorAll("input")) {
                                                item.value = ""
                                        }
                                        $("#Contact")[0].querySelector("textarea").value = ""
                                        $event.preventDefault()
                                }
                        }

                }

                $scope.btnCheckOut = function () {
                        $(".btn-confirm-buycart").addClass("btn-confirm-buycart-active", 250, $scope.btnCheckOutValidate());
                }
                $scope.btnCheckOutValidate = function () {
                        setTimeout(function () {
                                $(".btn-confirm-buycart").removeClass("btn-confirm-buycart-active");
                                $(".btn-confirm-buycart").addClass("validate", 450,);
                                $(".btn-confirm-buycart").attr("disabled", "");
                                setTimeout( () => {
                                        $location.path("/CheckOut")
                                        $route.reload()
                                }, 1000)
                        }, 2250);
                }
                $scope.addEmailFooter = function() {
                        inputFooterElement = document.querySelector("#inputFooter")
                        if (inputFooterElement.value && inputFooterElement.checkValidity()) {
                                if (!localStorage.getItem("emailsCustomer")) {
                                        localStorage.setItem("emailsCustomer", JSON.stringify([inputFooterElement.value]))
                                        inputFooterElement.value = ""
                                }
                                else {
                                        jsonEmail = JSON.parse(localStorage.getItem("emailsCustomer"))
                                        jsonEmail.push(inputFooterElement.value)
                                        localStorage.setItem("emailsCustomer", JSON.stringify(jsonEmail))
                                        inputFooterElement.value = ""

                                }
                        }
                }

                $scope.getCardType = function (event) {
                        if (document.querySelector(".credit-active")) {
                                document.querySelector(".credit-active").classList.remove("credit-active")
                                event.target.classList.add("credit-active")
                        }
                        else {
                                event.target.classList.add("credit-active")
                        }
                }
                $scope.validateCardType = false
                $scope.getDataBuy = function (event) {
                        //event.preventDefault()
                        check = true
                        dataInput = document.querySelector("#CheckOut").querySelectorAll("input")
                        cardType = document.querySelector(".credit-active")
                        for (const item of dataInput) {
                                if (item.value.trim() == "") {
                                        check = false
                                }
                        }
                        
                        if (check && cardType) {
                                dataSendLocal = []
                                for (const item of dataInput) {
                                        dataSendLocal.push(item.value)
                                }
                                dataSendLocal.push(cardType.getAttribute("Value"))
                                jsonBuyingDetails = {
                                        customer: dataSendLocal,
                                        orderProducts: JSON.parse(localStorage.getItem("dataProductClient"))
                                }
                                localStorage.setItem("dataProductClient", JSON.stringify([]))
                                if (!localStorage.getItem("historyBuyList")) {
                                        localStorage.setItem("historyBuyList", JSON.stringify([jsonBuyingDetails]))
                                }
                                else {
                                        historyBuyList = JSON.parse(localStorage.getItem("historyBuyList"))
                                        historyBuyList.push(jsonBuyingDetails)
                                        localStorage.setItem("historyBuyList", JSON.stringify(historyBuyList))
                                }
                                $location.path("/")
                                $route.reload()
                        }
                        else if (!cardType) {
                                $scope.validateCardType = true
                        }
                        else {
                                $scope.validateCardType = false
                        }
                }
                $scope.indexShowItem = 8
                $scope.raiseIndexShowItem = 8
                $scope.raiseIndex = function() {
                        $scope.indexShowItem += $scope.raiseIndexShowItem
                }
                $scope.showItem = function (index) {
                        if (index < $scope.indexShowItem) {
                                return true
                        }
                }
                $scope.changeInputCardNumber = function () {
                        CardNumber = document.querySelector("#CardNumber").value
                        if (CardNumber.length == 4 || CardNumber.length == 9 || CardNumber.length == 14) {
                                document.querySelector("#CardNumber").value = CardNumber + " "
                        }
                }

                $scope.runDataHistory = function () {
                        $scope.dataHistory = JSON.parse(localStorage.getItem("historyBuyList"))
                }
                $scope.$on('$viewContentLoaded', function(){ 
                        setTimeout(() => {
                                $(".carousel-control-next").click()
                        }, 3000)
                });
                $scope.scrollToTop = function (time = 0) {
                        setTimeout(() => {
                                $window.scrollTo(0, 0)
                        }, time)
                }
        })