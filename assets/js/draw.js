var request = new XMLHttpRequest();
request.open('GET', 'http://api.fixer.io/latest');
request.setRequestHeader('Access-Control-Allow-Origin', '*');
request.send();
request.onreadystatechange = function (e) {
    if (this.readyState == 4 && this.status == 200) {
        var response = JSON.parse(this.responseText);
        var finalArray2 = [];

        function finalToData2(currency, spot) {
            this.currency = currency;
            this.spot = spot;
        }

        var cuisines = ["EUR"];
        var val = response.rates;
        for (var j in val) {
            var sub_key = j;
            cuisines.push(sub_key);
            var sub_val = val[j];
            var object = new finalToData2(sub_key, sub_val);
            finalArray2.push(object);
        }

        $(function () {
            $('#table').bootstrapTable({
                data: finalArray2
            });
        });

        var sel = document.getElementById('baseList');
        var fragment = document.createDocumentFragment();
        cuisines.forEach(function (cuisine, index) {
            var opt = document.createElement('option');
            opt.innerHTML = cuisine;
            opt.value = cuisine;
            fragment.appendChild(opt);
        });
        sel.appendChild(fragment);

        var sel2 = document.getElementById('symbolList');
        var fragment2 = document.createDocumentFragment();
        cuisines.forEach(function (cuisine, index) {
            var opt2 = document.createElement('option');
            opt2.innerHTML = cuisine;
            opt2.value = cuisine;
            fragment2.appendChild(opt2);
        });
        sel2.appendChild(fragment2);

        console.log(JSON.stringify(finalArray2));
    }
    else {
        // тут сообщаем о сетевой ошибке
    }
};

$(function () {

    $('#colorpicker').colorpicker();

    $('#datepicker').datepicker({
        format: 'mm/dd/yyyy',
        startDate: '01/01/2000',
        weekStart: 1,
        autoclose: true,
        todayHighlight: true
    });
    if ($("#dateFrom").val() == '') {
        function createDate() {
            var date = new Date();
            date.setMonth(date.getMonth() - 3);
            return date;
        }

        $("#dateFrom").val(d3.time.format('%x')(createDate()));
    }
    if ($("#dateTo").val() == '') {
        $("#dateTo").val(d3.time.format('%x')(new Date()));
    }
});

d3.select(".save").on("click", function(){
    saveSvgAsPng(d3.select('svg').node(), 'chart.png');
});

$('.draw').on('click', function () {
    var color = document.getElementById('color').value;

    Date.prototype.addDays = function (days) {
        var dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    };

    function getDates(startDate, stopDate) {
        var dateArray = new Array();
        var currentDate = startDate;
        while (currentDate <= stopDate) {
            dateArray.push(currentDate);
            currentDate = currentDate.addDays(1);
        }
        return dateArray;
    }

    function getFormattedDate(date) {
        var year = date.getFullYear();
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        return year + '-' + month + '-' + day;
    }

    var dateFrom = document.getElementById('dateFrom').value;
    var dateTo = document.getElementById('dateTo').value;
    var dateArray = getDates(new Date(dateFrom), new Date(dateTo));
    /*for (i = 0; i < dateArray.length; i ++ ) {
     alert (getFormattedDate(dateArray[i]));
     }*/
    function allIn(responseArray) {
        function valueToData(date, rate) {
            var valueToData = [];
            valueToData[0] = new Date(date).getTime();
            valueToData[1] = rate;
            return valueToData;
        }

        function finalToData(key, value) {
            this.key = key;
            this.values = value;
        }

        function valueToDataLine(x, y) {
            this.x = new Date(x).getTime();
            this.y = y;
        }

        var finalArray = [];
        var keyArray = [];

        //get keyArray
        for (var ra in responseArray) {
            var response = responseArray[ra];
            var val = response.rates;
            for (var j in val) {
                var sub_key = j;
                keyArray.push(sub_key);
                /*var sub_val = val[j];
                 var valueArray = [];
                 valueArray.push(valueToData(response.date, sub_val));
                 var object = new finalToData(sub_key, valueArray);
                 finalArray.push(object);*/
            }
        }

        keyArray = jQuery.unique(keyArray);
        console.log(keyArray);

        for (var ka in keyArray) {
            var valueArray = [];
            for (var ra in responseArray) {
                var response = responseArray[ra];
                var val = response.rates;
                var sub_val = val[keyArray[ka]];
                // valueArray.push(valueToData(response.date, sub_val));
                valueArray.push(new valueToDataLine(response.date, sub_val));
            }

            var object = new finalToData(keyArray[ka], valueArray);
            finalArray.push(object);
        }

        console.log("finalArray: " + JSON.stringify(finalArray));

        return finalArray;
    }

    function drawGraph(histcatexplong) {
        // var colors = d3.scale.category20();
        var chart;
        nv.addGraph(function () {
            chart = nv.models.stackedAreaChart()
                .margin({left: 100, right: 50})
                .useInteractiveGuideline(true)
                .x(function (d) {
                    return d[0]
                })
                .y(function (d) {
                    return d[1]
                })
                .duration(300)
                .showControls(false)
                .clipEdge(true)
                .showLegend(false)
                .color([color])
            ;
            chart.xAxis
                .tickFormat(function (d) {
                    return d3.time.format('%x')(new Date(d))
                });
            chart.yAxis.tickFormat(d3.format(',.4f'));

            // chart.legend.vers('furious');
            d3.select('#chart1')
                .datum(histcatexplong)
                .transition().duration(500)
                .call(chart)
                .each('start', function () {
                    setTimeout(function () {
                        d3.selectAll('#chart1 *').each(function () {
                            if (this.__transition__)
                                this.__transition__.duration = 1;
                        })
                    }, 0)
                });
            nv.utils.windowResize(chart.update);
            return chart;
        });
    }

    function drawLineGraph(histcatexplong) {
        nv.addGraph(function () {
            var chart = nv.models.lineWithFocusChart()
                    .margin({"right": 50})
                    .useInteractiveGuideline(true)
                    .showLegend(false)
                    .color([color])
                ;

            chart.xAxis
                .tickFormat(function (d) {
                    return d3.time.format('%x')(new Date(d))
                });

            chart.x2Axis
                .tickFormat(function (d) {
                    return d3.time.format('%x')(new Date(d))
                });

            chart.yAxis
                .tickFormat(d3.format(',.4f'));

            chart.y2Axis
                .tickFormat(d3.format(',.4f'));

            chart.xScale(d3.time.scale.utc());

            d3.select('#chart1')
                .datum(histcatexplong)
                .transition().duration(100)
                .call(chart);

            nv.utils.windowResize(chart.update);

            return chart;
        });
    }

    var responseArray = [];
    var base = document.getElementById('baseList').value;
    var symbol = document.getElementById('symbolList').value;
    // for (i = 0; i < dateArray.length; i++) {
    //     var request = new XMLHttpRequest();
    //     request.open('GET', 'http://api.fixer.io/' + getFormattedDate(dateArray[i]) + 'base=' + base + '&?symbols=' + symbol);
    //     request.send();
    //     request.onreadystatechange = function (e) {
    //         if (this.readyState == 4 && this.status == 200) {
    //             // var response = JSON.parse(this.responseText);
    //             responseArray.push(JSON.parse(this.responseText));
    //
    //             if (responseArray.length >= dateArray.length) {
    //                 var histcatexplong = allIn(responseArray);
    //                 // drawGraph(histcatexplong);
    //                 drawLineGraph(histcatexplong);
    //                 /*console.log(i + ": responseArray - " + responseArray.length);
    //                  console.log(i + ": dateArray - " + dateArray.length);*/
    //             }
    //         }
    //         else {
    //             // тут сообщаем о сетевой ошибке
    //         }
    //
    //     };
    // }


    var f = (function () {
        // scope a
        var xhr = [],
            successfulRequests = 0,
            responseString = "";

        for (i = 0; i < dateArray.length; i++) {
            (function (i) {
                xhr[i] = new XMLHttpRequest();
                url = 'http://api.fixer.io/' + getFormattedDate(dateArray[i]) + 'base=' + base + '&?symbols=' + symbol;
                xhr[i].open("GET", url, true);
                xhr[i].onreadystatechange = function () {
                    if (xhr[i].readyState == 4 && xhr[i].status == 200) {
                        // scope b

                        // track successful requests here
                        successfulRequests++;                   // "remembered" through closure
                        // responseString += xhr[i].responseText;  // "remembered" through closure
                        responseArray.push(JSON.parse(this.responseText));  // "remembered" through closure

                        if (successfulRequests == dateArray.length) {
                            responseArray.sort(function(a,b) {
                                return new Date(a.date).getTime() - new Date(b.date).getTime()
                            });

                            var histcatexplong = allIn(responseArray);
                                // drawGraph(histcatexplong);
                            drawLineGraph(histcatexplong);
                            // console.log(responseString);
                        }
                    }
                };
                xhr[i].send();
            })(i);
        }
    })();

    return false;
});