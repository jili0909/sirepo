'use strict';

var srlog = SIREPO.srlog;
var srdbg = SIREPO.srdbg;
SIREPO.PLOTTING_LINE_CSV_EVENT = 'plottingLineoutCSV';
SIREPO.DEFAULT_COLOR_MAP = 'viridis';

SIREPO.app.factory('plotting', function(appState, d3Service, frameCache, panelState, utilities, $interval, $rootScope, $window) {

    var INITIAL_HEIGHT = 400;
    var MAX_PLOTS = 11;
    var COLOR_MAP = {
        grayscale: ['#333', '#fff'],
        afmhot: colorsFromString('0000000200000400000600000800000a00000c00000e00001000001200001400001600001800001a00001c00001e00002000002200002400002600002800002a00002c00002e00003000003200003400003600003800003a00003c00003e00004000004200004400004600004800004a00004c00004e00005000005200005400005600005800005a00005c00005e00006000006200006400006600006800006a00006c00006e00007000007200007400007600007800007a00007c00007e00008000008202008404008607008808008a0a008c0d008e0f009010009212009414009617009818009a1a009c1d009e1f00a02000a22200a42400a62700a82800aa2a00ac2d00ae2f00b03000b23200b43400b63700b83800ba3a00bc3d00be3f00c04000c24200c44400c64600c84800ca4a00cc4d00ce4e00d05000d25200d45400d65600d85800da5a00dc5d00de5e00e06000e26200e46400e66600e86800ea6a00ec6d00ee6e00f07000f27200f47400f67600f87800fa7a00fc7d00fe7e00ff8001ff8203ff8405ff8607ff8809ff8b0bff8c0dff8e0fff9011ff9213ff9415ff9617ff9919ff9b1bff9c1dff9e1fffa021ffa223ffa425ffa627ffa829ffab2bffac2dffae2fffb031ffb233ffb435ffb637ffb939ffbb3bffbc3dffbe3fffc041ffc243ffc445ffc647ffc849ffcb4bffcc4dffce4fffd051ffd253ffd455ffd657ffd959ffdb5bffdc5dffde5fffe061ffe263ffe465ffe667ffe869ffeb6bffec6dffee6ffff071fff273fff475fff677fff979fffb7bfffc7dfffe7fffff81ffff83ffff85ffff87ffff89ffff8bffff8dffff8fffff91ffff93ffff95ffff97ffff99ffff9bffff9dffff9fffffa1ffffa3ffffa5ffffa7ffffa9ffffabffffadffffafffffb1ffffb3ffffb5ffffb7ffffb9ffffbbffffbdffffbfffffc1ffffc3ffffc5ffffc7ffffc9ffffcbffffcdffffcfffffd1ffffd3ffffd5ffffd7ffffd9ffffdbffffddffffdfffffe1ffffe3ffffe5ffffe7ffffe9ffffebffffedffffeffffff1fffff3fffff5fffff7fffff9fffffbfffffdffffff'),
        coolwarm: colorsFromString('3b4cc03c4ec23d50c33e51c53f53c64055c84257c94358cb445acc455cce465ecf485fd14961d24a63d34b64d54c66d64e68d84f69d9506bda516ddb536edd5470de5572df5673e05875e15977e35a78e45b7ae55d7ce65e7de75f7fe86180e96282ea6384eb6485ec6687ed6788ee688aef6a8bef6b8df06c8ff16e90f26f92f37093f37295f47396f57597f67699f6779af7799cf87a9df87b9ff97da0f97ea1fa80a3fa81a4fb82a6fb84a7fc85a8fc86a9fc88abfd89acfd8badfd8caffe8db0fe8fb1fe90b2fe92b4fe93b5fe94b6ff96b7ff97b8ff98b9ff9abbff9bbcff9dbdff9ebeff9fbfffa1c0ffa2c1ffa3c2fea5c3fea6c4fea7c5fea9c6fdaac7fdabc8fdadc9fdaec9fcafcafcb1cbfcb2ccfbb3cdfbb5cdfab6cefab7cff9b9d0f9bad0f8bbd1f8bcd2f7bed2f6bfd3f6c0d4f5c1d4f4c3d5f4c4d5f3c5d6f2c6d6f1c7d7f0c9d7f0cad8efcbd8eeccd9edcdd9eccedaebcfdaead1dae9d2dbe8d3dbe7d4dbe6d5dbe5d6dce4d7dce3d8dce2d9dce1dadce0dbdcdedcdddddddcdcdedcdbdfdbd9e0dbd8e1dad6e2dad5e3d9d3e4d9d2e5d8d1e6d7cfe7d7cee8d6cce9d5cbead5c9ead4c8ebd3c6ecd3c5edd2c3edd1c2eed0c0efcfbfefcebdf0cdbbf1cdbaf1ccb8f2cbb7f2cab5f2c9b4f3c8b2f3c7b1f4c6aff4c5adf5c4acf5c2aaf5c1a9f5c0a7f6bfa6f6bea4f6bda2f7bca1f7ba9ff7b99ef7b89cf7b79bf7b599f7b497f7b396f7b194f7b093f7af91f7ad90f7ac8ef7aa8cf7a98bf7a889f7a688f6a586f6a385f6a283f5a081f59f80f59d7ef59c7df49a7bf4987af39778f39577f39475f29274f29072f18f71f18d6ff08b6ef08a6cef886bee8669ee8468ed8366ec8165ec7f63eb7d62ea7b60e97a5fe9785de8765ce7745be67259e57058e46e56e36c55e36b54e26952e16751e0654fdf634ede614ddd5f4bdc5d4ada5a49d95847d85646d75445d65244d55042d44e41d24b40d1493fd0473dcf453ccd423bcc403acb3e38ca3b37c83836c73635c53334c43032c32e31c12b30c0282fbe242ebd1f2dbb1b2cba162bb8122ab70d28b50927b40426'),
        jet: colorsFromString('00008000008400008900008d00009200009600009b00009f0000a40000a80000ad0000b20000b60000bb0000bf0000c40000c80000cd0000d10000d60000da0000df0000e30000e80000ed0000f10000f60000fa0000ff0000ff0000ff0000ff0000ff0004ff0008ff000cff0010ff0014ff0018ff001cff0020ff0024ff0028ff002cff0030ff0034ff0038ff003cff0040ff0044ff0048ff004cff0050ff0054ff0058ff005cff0060ff0064ff0068ff006cff0070ff0074ff0078ff007cff0080ff0084ff0088ff008cff0090ff0094ff0098ff009cff00a0ff00a4ff00a8ff00acff00b0ff00b4ff00b8ff00bcff00c0ff00c4ff00c8ff00ccff00d0ff00d4ff00d8ff00dcfe00e0fb00e4f802e8f406ecf109f0ee0cf4eb0ff8e713fce416ffe119ffde1cffdb1fffd723ffd426ffd129ffce2cffca30ffc733ffc436ffc139ffbe3cffba40ffb743ffb446ffb149ffad4dffaa50ffa753ffa456ffa05aff9d5dff9a60ff9763ff9466ff906aff8d6dff8a70ff8773ff8377ff807aff7d7dff7a80ff7783ff7387ff708aff6d8dff6a90ff6694ff6397ff609aff5d9dff5aa0ff56a4ff53a7ff50aaff4dadff49b1ff46b4ff43b7ff40baff3cbeff39c1ff36c4ff33c7ff30caff2cceff29d1ff26d4ff23d7ff1fdbff1cdeff19e1ff16e4ff13e7ff0febff0ceeff09f1fc06f4f802f8f500fbf100feed00ffea00ffe600ffe200ffde00ffdb00ffd700ffd300ffd000ffcc00ffc800ffc400ffc100ffbd00ffb900ffb600ffb200ffae00ffab00ffa700ffa300ff9f00ff9c00ff9800ff9400ff9100ff8d00ff8900ff8600ff8200ff7e00ff7a00ff7700ff7300ff6f00ff6c00ff6800ff6400ff6000ff5d00ff5900ff5500ff5200ff4e00ff4a00ff4700ff4300ff3f00ff3b00ff3800ff3400ff3000ff2d00ff2900ff2500ff2200ff1e00ff1a00ff1600ff1300fa0f00f60b00f10800ed0400e80000e40000df0000da0000d60000d10000cd0000c80000c40000bf0000bb0000b60000b20000ad0000a80000a400009f00009b00009600009200008d0000890000840000800000'),
        viridis: colorsFromString('44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725'),
    };

    var isPlottingReady = false;
    var ColorRange = function() {
        this.resetEMA = function() {
            this.minEMA = new EMA();
            this.maxEMA = new EMA();
        };
        this.setRange = function(min, max) {
            this.min = min;
            this.max = max;
        };
        this.resetEMA();
    };
    var EMA = function() {
        var avg = null;
        var length = 3;
        var alpha = 2.0 / (length + 1.0);
        this.compute = function(value) {
            return avg += avg !== null
                ? alpha * (value - avg)
                : value;
        };
    };

    d3Service.d3().then(function() {
        isPlottingReady = true;
    });

    function cleanNumber(v) {
        v = v.replace(/\.0+(\D+)/, '$1');
        v = v.replace(/(\.\d)0+(\D+)/, '$1$2');
        v = v.replace(/(\.0+)$/, '');
        return v;
    }

    function colorsFromString(s) {
        return s.match(/.{6}/g).map(function(x) {
            return "#" + x;
        });
    }

    function createAxis(scale, orient) {
        return d3.svg.axis()
            .scale(scale)
            .orient(orient);
    }

    function formatNumber(value) {
        if (value) {
            if (Math.abs(value) < 1e3 && Math.abs(value) > 1e-3) {
                return cleanNumber(value.toFixed(3));
            }
            else {
                return cleanNumber(value.toExponential(2));
            }
        }
        return '' + value;
    }

    function initAnimation(scope) {
        scope.prevFrameIndex = -1;
        scope.isPlaying = false;
        var requestData = scope.requestData || function() {
            if (! scope.hasFrames()) {
                return;
            }
            var index = frameCache.getCurrentFrame(scope.modelName);
            if (frameCache.getCurrentFrame(scope.modelName) == scope.prevFrameIndex) {
                return;
            }
            scope.prevFrameIndex = index;
            frameCache.getFrame(scope.modelName, index, scope.isPlaying, function(index, data) {
                if (scope.element) {
                    if (data.error) {
                        panelState.setError(scope.modelName, data.error);
                        return;
                    }
                    panelState.setError(scope.modelName, null);
                    scope.load(data);
                }
                if (scope.isPlaying) {
                    scope.advanceFrame(1);
                }
            });
        };
        scope.advanceFrame = function(increment, stopPlaying) {
            if (stopPlaying) {
                scope.isPlaying = false;
            }
            var next = frameCache.getCurrentFrame(scope.modelName) + increment;
            if (next < 0 || next > frameCache.getFrameCount(scope.modelName) - 1) {
                scope.isPlaying = false;
                return;
            }
            frameCache.setCurrentFrame(scope.modelName, next);
            requestData();
        };
        scope.defaultFrame = function() {
            if (scope.getDefaultFrame) {
                frameCache.setCurrentFrame(scope.modelName, scope.getDefaultFrame());
                requestData();
            }
            else {
                scope.lastFrame();
            }
        };
        scope.firstFrame = function() {
            scope.isPlaying = false;
            frameCache.setCurrentFrame(scope.modelName, 0);
            if (scope.modelChanged) {
                scope.modelChanged();
            }
            requestData();
        };
        scope.hasFrames = function() {
            return frameCache.isLoaded() && frameCache.getFrameCount(scope.modelName) > 0;
        };
        scope.hasManyFrames = function() {
            if (SIREPO.SINGLE_FRAME_ANIMATION && SIREPO.SINGLE_FRAME_ANIMATION.indexOf(scope.modelName) >= 0) {
                return false;
            }
            return frameCache.isLoaded() && frameCache.getFrameCount(scope.modelName) > 1;
        };
        scope.isFirstFrame = function() {
            return frameCache.getCurrentFrame(scope.modelName) === 0;
        };
        scope.isLastFrame = function() {
            return frameCache.getCurrentFrame(scope.modelName) == frameCache.getFrameCount(scope.modelName) - 1;
        };
        scope.lastFrame = function() {
            scope.isPlaying = false;
            frameCache.setCurrentFrame(scope.modelName, frameCache.getFrameCount(scope.modelName) - 1);
            requestData();
        };
        scope.togglePlay = function() {
            scope.isPlaying = ! scope.isPlaying;
            if (scope.isPlaying) {
                if (scope.isLastFrame()) {
                    frameCache.setCurrentFrame(scope.modelName, 0);
                    requestData();
                }
                else {
                    scope.advanceFrame(1);
                }
            }
        };
        scope.$on('framesCleared', function() {
            scope.prevFrameIndex = -1;
            if (scope.clearData) {
                scope.clearData();
            }
        });
        scope.$on('modelsLoaded', requestData);
        scope.$on('framesLoaded', function(event, oldFrameCount) {
            if (scope.prevFrameIndex < 0 || oldFrameCount === 0) {
                scope.defaultFrame();
            }
            else if (scope.prevFrameIndex > frameCache.getFrameCount(scope.modelName)) {
                scope.firstFrame();
            }
            // go to the next last frame, if the current frame was the previous last frame
            else if (frameCache.getCurrentFrame(scope.modelName) >= oldFrameCount - 1) {
                scope.defaultFrame();
            }
        });
        return requestData;
    }

    function initPlot(scope) {
        var priority = 0;
        var current = scope.$parent;
        while (current) {
            if (current.requestPriority) {
                priority = current.requestPriority;
                break;
            }
            current = current.$parent;
        }
        var interval = null;
        var requestData = function(forceRunCount) {
            interval = $interval(function() {
                if (interval) {
                    $interval.cancel(interval);
                    interval = null;
                }
                if (! scope.element) {
                    return;
                }
                panelState.requestData(scope.modelName, function(data) {
                    if (! scope.element) {
                        return;
                    }
                    forceRunCount = forceRunCount || 0;
                    if (data.x_range) {
                        scope.clearData();
                        scope.load(data);
                        if (data.summaryData) {
                            $rootScope.$broadcast(scope.modelName + '.summaryData', data.summaryData);
                        }
                    }
                    else if (forceRunCount++ <= 2) {
                        // try again, probably bad data
                        panelState.clear(scope.modelName);
                        requestData(forceRunCount);
                    }
                    else {
                        panelState.setError(scope.modelName, 'server error: incomplete result');
                        srlog('incomplete response: ', data);
                    }
                }, forceRunCount ? true : false);
            }, 50 + priority * 10, 1);
        };
        return requestData;
    }

    function linspace(start, stop, nsteps) {
        var delta = (stop - start) / (nsteps - 1);
        var res = d3.range(nsteps).map(function(d) { return start + d * delta; });
        res[res.length - 1] = stop;

        if (res.length != nsteps) {
            throw "invalid linspace steps: " + nsteps + " != " + res.length;
        }
        return res;
    }

    return {
        COLOR_MAP: COLOR_MAP,

        addConvergencePoints: function(select, parentClass, pointsList, points) {
            var i;
            if (points.length > 1 && SIREPO.PLOTTING_SUMMED_LINEOUTS) {
                var newPoints = [];
                var dist = (points[1][0] - points[0][0]) / 2.0;
                newPoints.push(points[0]);
                var prevY = points[0][1];
                for (i = 1; i < points.length; i++) {
                    var p = points[i];
                    if (prevY != p[1]) {
                        var x = p[0] - dist;
                        newPoints.push([x, prevY], [x, p[1]]);
                        prevY = p[1];
                    }
                }
                newPoints.push(points[points.length - 1]);
                points = newPoints;
            }
            pointsList.splice(0, 0, points);
            if (pointsList.length > MAX_PLOTS) {
                pointsList = pointsList.slice(0, MAX_PLOTS);
            }
            for (i = 0; i < MAX_PLOTS; i++) {
                select(parentClass + ' .line-' + i).datum(pointsList[i] || []);
            }
            return pointsList;
        },

        createAxis: createAxis,

        createColorRange: function() {
            return new ColorRange();
        },

        createExponentialAxis: function(scale, orient) {
            return createAxis(scale, orient)
            // this causes a 'number of fractional digits' error in MSIE
            //.tickFormat(d3.format('e'))
                .tickFormat(formatNumber);
        },

        exportCSV: function(fileName, heading, points) {
            fileName = fileName.replace(/\s+$/, '').replace(/(\_|\W|\s)+/g, '-') + '.csv';
            // format csv heading values within quotes
            var res = '"' + heading.map(function(v) {
                return v.replace(/"/g, '');
            }).join('","') + '"' + "\n";
            points.forEach(function(row) {
                res += row[0].toExponential(9) + ',' + row[1].toExponential(9) + "\n";
            });
            saveAs(new Blob([res], {type: "text/csv;charset=utf-8"}), fileName);
        },

        drawImage: function(xAxisScale, yAxisScale, width, height, xValues, yValues, canvas, cacheCanvas, alignOnPixel) {
            var xZoomDomain = xAxisScale.domain();
            var xDomain = [xValues[0], xValues[xValues.length - 1]];
            var yZoomDomain = yAxisScale.domain();
            var yDomain = [yValues[0], yValues[yValues.length - 1]];
            var zoomWidth = xZoomDomain[1] - xZoomDomain[0];
            var zoomHeight = yZoomDomain[1] - yZoomDomain[0];
            canvas.width = width;
            canvas.height = height;
            var xPixelSize = alignOnPixel ? ((xDomain[1] - xDomain[0]) / zoomWidth * width / xValues.length) : 0;
            var yPixelSize = alignOnPixel ? ((yDomain[1] - yDomain[0]) / zoomHeight * height / yValues.length) : 0;
            var ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
            ctx.drawImage(
                cacheCanvas,
                -(xZoomDomain[0] - xDomain[0]) / zoomWidth * width - xPixelSize / 2,
                -(yDomain[1] - yZoomDomain[1]) / zoomHeight * height - yPixelSize / 2,
                (xDomain[1] - xDomain[0]) / zoomWidth * width + xPixelSize,
                (yDomain[1] - yDomain[0]) / zoomHeight * height + yPixelSize);
        },

        extractUnits: function(scope, axis, label) {
            scope[axis + 'units'] = '';
            var match = label.match(/\[(.*?)\]/);
            if (match) {
                scope[axis + 'units'] = match[1];
                label = label.replace(/\[.*?\]/, '');
            }
            return label;
        },

        fixFormat: function(scope, axis, precision) {
            var format = d3.format('.' + (precision || '3') + 's');
            // amounts near zero may appear as NNNz, change them to 0
            return function(n) {
                var units = scope[axis + 'units'];
                if (! units) {
                    return cleanNumber(formatNumber(n));
                }
                var v = format(n);
                //TODO(pjm): use a regexp
                if ((v && (v.indexOf('z') > 0 || v.indexOf('y') > 0)) || v == '0.00' || v == '0.0000') {
                    return '0';
                }
                v = cleanNumber(v);
                return v + units;
            };
        },

        initialHeight: function(scope) {
            return scope.isAnimation ? 1 : INITIAL_HEIGHT;
        },

        colorMapFromModel: function(modelName) {

            var model = appState.models[modelName];
            var modelMap = model ? model.colorMap : null;

            var modelDefaultMap;
            var info = SIREPO.APP_SCHEMA.model[modelName];
            if(info) {
                var mapInfo = info.colorMap;
                modelDefaultMap = mapInfo ? mapInfo[SIREPO.INFO_INDEX_DEFAULT_VALUE] : null;
            }

            return this.colorMapOrDefault(modelMap, modelDefaultMap);
        },

        colorMapNameOrDefault: function (mapName, defaultMapName) {
            return mapName || defaultMapName || SIREPO.PLOTTING_COLOR_MAP || SIREPO.DEFAULT_COLOR_MAP;
        },

        colorMapOrDefault: function (mapName, defaultMapName) {
            return COLOR_MAP[this.colorMapNameOrDefault(mapName, defaultMapName)];
        },

        initImage: function(plotRange, heatmap, cacheCanvas, imageData, modelName) {
            var m = appState.models[modelName];
            var zMin = plotRange.min;
            var zMax = plotRange.max;
            if (m.colorRangeType == 'smooth') {
                zMin = plotRange.minEMA.compute(zMin);
                zMax = plotRange.maxEMA.compute(zMax);
            }
            else if (m.colorRangeType == 'fixed') {
                zMin = m.colorMin;
                zMax = m.colorMax;
            }
            var colorMap = this.colorMapFromModel(modelName);
            var colorScale = d3.scale.linear()
                .domain(linspace(zMin, zMax, colorMap.length))
                .range(colorMap)
                .clamp(true);
            var xSize = heatmap[0].length;
            var ySize = heatmap.length;
            var img = imageData;

            for (var yi = 0, p = -1; yi < ySize; ++yi) {
                for (var xi = 0; xi < xSize; ++xi) {
                    var c = d3.rgb(colorScale(heatmap[yi][xi]));
                    img.data[++p] = c.r;
                    img.data[++p] = c.g;
                    img.data[++p] = c.b;
                    img.data[++p] = 255;
                }
            }
            cacheCanvas.getContext('2d').putImageData(img, 0, 0);
            return colorScale;
        },

        isPlottingReady: function() {
            return isPlottingReady;
        },

        linkPlot: function(scope, element) {
            d3Service.d3().then(function(d3) {
                scope.element = element[0];
                scope.isAnimation = scope.modelName.indexOf('Animation') >= 0;
                var requestData;

                if (scope.isClientOnly) {
                    requestData = function() {};
                }
                else if (scope.isAnimation) {
                    requestData = initAnimation(scope);
                }
                else {
                    requestData = initPlot(scope);
                }

                scope.windowResize = utilities.debounce(function() {
                    scope.resize();
                }, 250);

                scope.$on('$destroy', function() {
                    scope.destroy();
                    $(d3.select(scope.element).select('svg').node()).off();
                    scope.element = null;
                    $($window).off('resize', scope.windowResize);
                });

                scope.$on(
                    scope.modelName + '.changed',
                    function() {
                        scope.prevFrameIndex = -1;
                        if (scope.modelChanged) {
                            scope.modelChanged();
                        }
                        panelState.clear(scope.modelName);
                        requestData();
                    });
                scope.isLoading = function() {
                    if (scope.isAnimation) {
                        return false;
                    }
                    return panelState.isLoading(scope.modelName);
                };
                $($window).resize(scope.windowResize);
                // #777 catch touchstart on outer svg nodes to prevent browser zoom on ipad
                $(d3.select(scope.element).select('svg').node()).on('touchstart touchmove', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                });
                scope.init();
                if (appState.isLoaded()) {
                    if (scope.isAnimation && scope.defaultFrame) {
                        scope.defaultFrame();
                    }
                    else {
                        requestData();
                    }
                }
            });
        },

        linspace: linspace,

        min2d: function(data) {
            return d3.min(data, function(row) {
                return d3.min(row);
            });
        },

        max2d: function(data) {
            return d3.max(data, function(row) {
                return d3.max(row);
            });
        },

        recalculateDomainFromPoints: function(yScale, points, xDomain, invertAxis) {
            var ydom;

            for (var i = 0; i < points.length; i++) {
                var d = points[i];
                if (d[0] > xDomain[1] || d[0] < xDomain[0]) {
                    continue;
                }
                if (ydom) {
                    if (d[1] < ydom[0]) {
                        ydom[0] = d[1];
                    }
                    else if (d[1] > ydom[1]) {
                        ydom[1] = d[1];
                    }
                }
                else {
                    ydom = [d[1], d[1]];
                }
            }
            if (ydom && ydom[0] != ydom[1]) {
                if (ydom[0] > 0) {
                    ydom[0] = 0;
                }
                if (invertAxis) {
                    var x = ydom[0];
                    ydom[0] = ydom[1];
                    ydom[1] = x;
                }
                yScale.domain(ydom).nice();
            }
        },

        refreshConvergencePoints: function(select, parentClass, graphLine) {
            for (var i = 0; i < MAX_PLOTS; i++) {
                select(parentClass + ' .line-' + i).attr('d', graphLine);
            }
        },

        ticks: function(axis, width, isHorizontalAxis) {
            var spacing = isHorizontalAxis ? 80 : 50;
            var n = Math.max(Math.round(width / spacing), 2);
            axis.ticks(n);
        },

        // ensures the axis domain fits in the fullDomain
        // returns true if size is reset to full
        trimDomain: function(axisScale, fullDomain) {
            var dom = axisScale.domain();
            var zoomSize = dom[1] - dom[0];

            if (zoomSize >= (fullDomain[1] - fullDomain[0])) {
                axisScale.domain(fullDomain);
                return true;
            }
            if (dom[0] < fullDomain[0]) {
                axisScale.domain([fullDomain[0], zoomSize + fullDomain[0]]);
            }
            if (dom[1] > fullDomain[1]) {
                axisScale.domain([fullDomain[1] - zoomSize, fullDomain[1]]);
            }
            return false;
        },

        select: function(scope, selector) {
            var e = d3.select(scope.element);
            return selector ? e.select(selector) : e;
        },

        calculateFWHM: function(xValues, yValues) {
            yValues = this.normalizeValues(yValues, 0.5);
            var positive = this.isPositive(yValues[0]);
            var listOfRoots = [];
            for (var i = 0; i < yValues.length; i++) {
                var currentPositive = this.isPositive(yValues[i]);
                if (currentPositive !== positive) {
                    listOfRoots.push(xValues[i - 1] + (xValues[i] - xValues[i - 1]) / (Math.abs(yValues[i]) + Math.abs(yValues[i - 1])) * Math.abs(yValues[i - 1]));
                    positive = !positive;
                }
            }
            var fwhm = NaN;
            if (listOfRoots.length >= 2) {
                fwhm = Math.abs(listOfRoots[listOfRoots.length - 1] - listOfRoots[0]);
            }
            return fwhm;
        },
        isPositive: function(num) {
            return true ? num > 0 : false;
        },
        normalizeValues: function (yValues, shift) {
            var yMin = Math.min.apply(Math, yValues);
            var yMax = Math.max.apply(Math, yValues);
            var yRange = yMax - yMin;
            for (var i = 0; i < yValues.length; i++) {
                yValues[i] = (yValues[i] - yMin) / yRange - shift;  // roots are at Y=0
            }
            return yValues;
        },
        formatValue: function (v, formatter, ordinateFormatter) {
            var fmt = formatter ? formatter : d3.format('.3f');
            var ordfmt = ordinateFormatter ? ordinateFormatter : d3.format('.3e');
            if (v < 1 || v > 1000000) {
                return ordfmt(v);
            }
            return fmt(v);
        },

    };
});

SIREPO.app.directive('animationButtons', function() {
    return {
        restrict: 'A',
        template: [
            '<div data-ng-if="isAnimation && hasManyFrames()" style="width: 100%;" class="text-center">',
              '<button type="button" class="btn btn-default" data-ng-disabled="isFirstFrame()" data-ng-click="firstFrame()"><span class="glyphicon glyphicon-backward"></span></button>',
              '<button type="button" class="btn btn-default" data-ng-disabled="isFirstFrame()" data-ng-click="advanceFrame(-1, true)"><span class="glyphicon glyphicon-step-backward"></span></button>',
              '<button type="button" class="btn btn-default" data-ng-click="togglePlay()"><span class="glyphicon glyphicon-{{ isPlaying ? \'pause\' : \'play\' }}"></span></button>',
              '<button type="button" class="btn btn-default" data-ng-disabled="isLastFrame()" data-ng-click="advanceFrame(1, true)"><span class="glyphicon glyphicon-step-forward"></span></button>',
              '<button type="button" class="btn btn-default" data-ng-disabled="isLastFrame()" data-ng-click="lastFrame()"><span class="glyphicon glyphicon-forward"></span></button>',
            '</div>',
        ].join(''),
    };
});

SIREPO.app.service('focusPointService', function(plotting) {

    this.formatFocusPointData = function(focusPoint) {
        var xText, yText, fwhmText = '';
        if (! isNaN(focusPoint.data.fwhm)) {
            fwhmText = 'FWHM = ' + d3.format('.6s')(focusPoint.data.fwhm) + focusPoint.config.axis.units;
        }
        if(! isNaN(focusPoint.data.x) && ! isNaN(focusPoint.data.y)) {
            xText = 'X = ' + plotting.formatValue(focusPoint.data.x);
            yText = 'Y = ' + plotting.formatValue(focusPoint.data.y);
        }
        return {
            xText: xText,
            yText: yText,
            fwhmText: fwhmText
        };
    };
    this.dataCoordsToMouseCoords = function(focusPoint) {
        var mouseX, mouseY;
        if (focusPoint.config.invertAxis) {
            mouseX = focusPoint.config.yAxisScale(focusPoint.data.y);
            mouseY = focusPoint.config.xAxisScale(focusPoint.data.x);
        }
        else {
            mouseX = focusPoint.config.xAxisScale(focusPoint.data.x);
            mouseY = focusPoint.config.yAxisScale(focusPoint.data.y);
        }
        return {
            x: mouseX,
            y: mouseY
        };
    };

    this.updateFocus = function(focusPoint, mouseX, mouseY) {

        // lastClickX determines if the user is panning or clicking on a point
        if (! focusPoint.config.points || Math.abs(focusPoint.data.lastClickX - d3.event[focusPoint.config.invertAxis ? 'clientY' : 'clientX']) > 10) {
            return false;
        }
        var xMin = focusPoint.config.xAxisScale.invert(mouseX - 10);
        var xMax = focusPoint.config.xAxisScale.invert(mouseX + 10);
        if (xMin > xMax) {
            var swap = xMin;
            xMin = xMax;
            xMax = swap;
        }
        var domain = focusPoint.config.xAxisScale.domain();
        if (xMin < domain[0]) {
            xMin = domain[0];
        }
        if (xMax > domain[1]) {
            xMax = domain[1];
        }

        focusPoint.data.focusIndex = -1;
        var maxPoint;
        for (var i = 0; i < focusPoint.config.points.length; i++) {
            var p = focusPoint.config.points[i];
            if (p[0] > xMax || p[0] < xMin) {
                continue;
            }
            if (! maxPoint || p[1] > maxPoint[1]) {
                maxPoint = p;
                focusPoint.data.focusIndex = i;
                focusPoint.data.isActive = true;
            }
        }
        if(maxPoint) {
            return this.updateFocusData(focusPoint);
        }
        return false;
    };

    this.updateFocusData = function(focusPoint) {
        if (! focusPoint.data.isActive) {
            return false;
        }

        var p = focusPoint.config.points[focusPoint.data.focusIndex];
        var domain = focusPoint.config.xAxisScale.domain();
        if (p[0] < domain[0] || p[0] > domain[1]) {
            return false;
        }

        focusPoint.data.x = p[0];
        focusPoint.data.y = p[1];
        focusPoint.data.fwhm = fwhmFromLocalVals(focusPoint);
        return true;
    };

    function fwhmFromLocalVals(focusPoint) {

        var points = focusPoint.config.points;
        var focusIndex = focusPoint.data.focusIndex;

        var xValues = [];
        var yValues = [];
        for (var i = 0; i < points.length; i++) {
            xValues.push(points[i][0]);
            yValues.push(points[i][1]);
        }

        // Find the local maximum and the left and right minima:
        var peakIndex = null;
        var rightMinIndex = null;
        var leftMinIndex = null;
        if (focusIndex < xValues.length - 1 && focusIndex > 0) { // check if the index is within the range
            if (points[focusIndex][1] < points[focusIndex - 1][1] || points[focusIndex][1] < points[focusIndex + 1][1]) { // step on the left and on the right to see if it's a local maximum
                // It's not a local maximum!
                if (points[focusIndex][1] < points[focusIndex - 1][1]) { // we are on the right from the maximum
                    for (i = focusIndex; i > 0; i--) { // <<< go to the left to find the maximum
                        if (points[i-1][1] < points[i][1]) { // we crossed the maximum and started to descend
                            // ^ <<< - we reached the maximum:
                            peakIndex = i;
                            break;
                        }
                    }
                }
                else { // we are on the left from the maximum
                    for (i = focusIndex + 1; i < xValues.length; i++) { // >>> go to the right to find the maximum
                        if (points[i-1][1] > points[i][1]) { // we crossed the maximum and started to descend
                            // >>> ^ - we reached the maximum:
                            peakIndex = i - 1;
                            break;
                        }
                    }
                }
            }
            else {
                // ^ - we are at the local maximum.
                peakIndex = focusIndex;
            }

            // >>> go to the right from the peak to find the right minimum:
            for (i = peakIndex + 1; i < xValues.length; i++) {
                if (points[i-1][1] < points[i][1]) {
                    // >>> v - we reached the right minimum:
                    rightMinIndex = i - 1;
                    break;
                }
            }
            if (! rightMinIndex) {
                rightMinIndex = xValues.length - 1;
            }

            // <<< go to the left to find the left minimum:
            for (i = peakIndex; i > 0; i--) {
                if (points[i-1][1] > points[i][1]) {
                    // v <<< - we reached the left minimum:
                    leftMinIndex = i;
                    break;
                }
            }
            if (! leftMinIndex) {
                leftMinIndex = 0;
            }
        }
        // Calculate the FWHM for the selected peak (between the left and the right minima - v^v):
        if (peakIndex) {
            var localXValues = [];
            var localYValues = [];
            for (i = leftMinIndex; i <= rightMinIndex; i++) {
                localXValues.push(points[i][0]);
                localYValues.push(points[i][1]);
            }
            return plotting.calculateFWHM(localXValues, localYValues);
        }
        return NaN;
    }

    this.setupFocusPoint = function(xAxisScale, yAxisScale, invertAxis, axis) {

        function init() {
            return {
                load: function(axisPoints, preservePoint) {
                    if (preservePoint && (axisPoints.length != (this.config.points || []).length)) {
                        preservePoint = false;
                    }
                    this.config.points = axisPoints;
                    if(preservePoint) {
                        return true;
                    }
                    return false;
                },
                move: function(step) {
                    if(! this.data.isActive) {
                        return false;
                    }
                    if(this.config.invertAxis) {
                        step = -step;
                    }
                    var newIndex = this.data.focusIndex + step;
                    if(newIndex < 0 || newIndex >= this.config.points.length) {
                        return false;
                    }
                    this.data.focusIndex = newIndex;
                    return true;
                },
                unset: function () {
                    this.data.focusIndex = -1;
                    this.data.isActive = false;
                },
                config: {
                    invertAxis: invertAxis,
                    xAxisScale: xAxisScale,
                    yAxisScale: yAxisScale,
                    axis: axis,
                },
                data: {
                    focusIndex: -1,
                    isActive: false,
                }
            };
        }

        return init();
    };

    // Each focus point info directive (focusCircle etc.) sets up the functions for its delegate
    // The parent plot directive (plot2d etc.) provides the completion methods
    // The interface property references the overlayInterface directive
    this.setupInfoDelegate = function(showCompletion, hideCompletion) {

        return {
            interface: null,
            showFocusPointInfo: function() {
                srlog('Override showFocusPointInfo in directive');
                return false;
            },
            showFocusPointInfoComplete: showCompletion ? showCompletion : function() {
            },
            moveFocusPointInfo: function() {
                srlog('Override moveFocusPointInfo in directive');
                return false;
            },
            hideFocusPointInfo: function() {
                srlog('Override hideFocusPointInfo in directive');
                return false;
            },
            hideFocusPointInfoComplete: hideCompletion ? hideCompletion : function() {
            },
        };
    };

    this.loadFocusPoint = function(focusPoint, axisPoints, preservePoint, plotInfoDelegates) {
        var hideAfterLoad = ! focusPoint.load(axisPoints, preservePoint);
        for(var dIndex = 0; dIndex < plotInfoDelegates.length; ++dIndex) {
            if(hideAfterLoad) {
                plotInfoDelegates[dIndex].hideFocusPointInfo();
            }
        }
    };
    this.refreshFocusPoint = function(focusPoint, plotInfoDelegates) {
        var refreshOK = focusPoint.data.isActive;
        for(var dIndex = 0; dIndex < plotInfoDelegates.length; ++dIndex) {
            if(refreshOK) {
                plotInfoDelegates[dIndex].showFocusPointInfo();
            }
            else {
                plotInfoDelegates[dIndex].hideFocusPointInfo();
            }
        }
    };

});

SIREPO.app.service('layoutService', function(plotting) {

    var svc = this;

    this.plotAxis = function(margin, dimension, orientation, refresh, utilities) {
        var FONT_SIZE = 12;
        var MAX_TICKS = 10;
        var ZERO_REGEX = /^\-?0(\.0+)?(e\+0)?$/;
        // global value, don't allow margin updates during zoom/pad handling
        svc.plotAxis.allowUpdates = true;

        var self = {};
        var debouncedRefresh = utilities.debounce(function() {
            var sum = margin.left + margin.right;
            refresh();
            if (sum != margin.left + margin.right) {
                refresh();
            }
        }, 500);

        function applyUnit(v, unit) {
            return unit ? unit.scale(v) : v;
        }

        function calcFormat(count, unit, base, isBaseFormat) {
            var code = 'e';
            var tickValues = self.scale.ticks(count);
            var v0 = applyUnit(tickValues[0] - (base || 0), unit);
            var v1 = applyUnit(tickValues[tickValues.length - 1] - (base || 0), unit);
            var p0 = valuePrecision(v0);
            var p1 = valuePrecision(v1);
            var decimals = valuePrecision(applyUnit(tickValues[1] - tickValues[0], unit));
            if (isBaseFormat || useFloatFormat(decimals)) {
                if ((v0 == 0 && useFloatFormat(p1)) || (v1 == 0 && useFloatFormat(p0)) || (useFloatFormat(p0) && useFloatFormat(p1))) {
                    code = 'f';
                }
            }
            else {
                if (p0 == 0) {
                    decimals -= p1;
                }
                else if (p1 == 0) {
                    decimals -= p0;
                }
                else {
                    decimals -= Math.max(p0, p1);
                }
            }
            decimals = decimals < 0 ? Math.abs(decimals) : 0;
            return {
                decimals: decimals,
                code: code,
                unit: unit,
                tickValues: tickValues,
                format: d3.format('.' + decimals + code),
            };
        }

        function calcTickCount(format, canvasSize, unit, base) {
            var d = self.scale.domain();
            var width = Math.max(
                4,
                Math.max(format(applyUnit(d[0] - (base || 0), unit)).length, format(applyUnit(d[1] - (base || 0), unit)).length)
            );
            var tickCount;
            if (dimension == 'x') {
                tickCount = Math.min(MAX_TICKS, Math.round(canvasSize.width / (width * FONT_SIZE)));
            }
            else {
                tickCount = Math.min(MAX_TICKS, Math.round(canvasSize.height / (5 * FONT_SIZE)));
            }
            return Math.max(2, tickCount);
        }

        //TODO(pjm): this could be refactored, moving the base recalc out
        function calcTicks(formatInfo, canvasSize, unit) {
            var d = self.scale.domain();
            var tickCount = calcTickCount(formatInfo.format, canvasSize, unit);
            formatInfo = calcFormat(tickCount, unit);
            if (formatInfo.decimals > 2) {
                var baseFormat = calcFormat(tickCount, unit, null, true).format;
                var base = midPoint(formatInfo, d);
                if (unit) {
                    unit = d3.formatPrefix(Math.max(Math.abs(d[0] - base), Math.abs(d[1] - base)), 0);
                }
                formatInfo = calcFormat(tickCount, unit, base);
                tickCount = calcTickCount(formatInfo.format, canvasSize, unit, base);
                var f2 = calcFormat(tickCount, unit);
                base = midPoint(f2, d);
                if (unit) {
                    unit = d3.formatPrefix(Math.max(Math.abs(d[0] - base), Math.abs(d[1] - base)), 0);
                }
                formatInfo = calcFormat(tickCount, unit, base);
                formatInfo.base = base;
                formatInfo.baseFormat = baseFormat;
            }
            if ((orientation == 'left' || orientation == 'right')) {
                var w = Math.max(formatInfo.format(applyUnit(d[0] - (formatInfo.base || 0), unit)).length, formatInfo.format(applyUnit(d[1] - (formatInfo.base || 0), unit)).length);
                margin[orientation] = (w + 6) * (FONT_SIZE / 2);
            }
            self.svgAxis.ticks(tickCount);
            self.tickCount = tickCount;
            self.svgAxis.tickFormat(function(v) {
                var res = formatInfo.format(applyUnit(v - (formatInfo.base || 0), unit));
                // format zero values as '0'
                if (ZERO_REGEX.test(res)) {
                    return '0';
                }
                return res;
            });
            return formatInfo;
        }

        function midPoint(formatInfo, domain) {
            // find the tickValue which is closest to the domain midpoint
            var mid = domain[0] + (domain[1] - domain[0]) / 2;
            var values = formatInfo.tickValues;
            var v = (values.length - 1) / 2;
            var i1 = Math.floor(v);
            var i2 = Math.ceil(v);
            if (Math.abs(values[i1] - mid) > Math.abs(values[i2] - mid)) {
                return values[i2];
            }
            return values[i1];
        }

        function useFloatFormat(logV) {
            return logV >= -2 && logV <= 3;
        }

        function valuePrecision(v) {
            Math.log10 = Math.log10 || function(x) {
                return Math.log(x) * Math.LOG10E;
            };
            return Math.floor(Math.log10(Math.abs(v || 1)));
        }

        self.createAxis = function(orient) {
            return d3.svg.axis().scale(self.scale).orient(orient || orientation);
        };

        self.createZoom = function() {
            return d3.behavior.zoom()[dimension](self.scale)
                .on('zoom', function() {
                    // don't update the plot margins during zoom/pad
                    svc.plotAxis.allowUpdates = false;
                    refresh();
                    svc.plotAxis.allowUpdates = true;
                    // schedule a refresh to adjust margins later
                    debouncedRefresh();
                });
        };

        self.init = function() {
            self.scale = d3.scale.linear();
            self.svgAxis = self.createAxis();
        };

        self.parseLabelAndUnits = function(label) {
            var match = label.match(/\[(.*?)\]/);
            if (match) {
                self.units = match[1];
                label = label.replace(/\s*\[.*?\]/, '');
            }
            else {
                self.units = '';
            }
            self.label = label;
        };

        function baseLabel() {
            // remove any parenthesis first, ex. "p (mec)" --> "p"
            var label = self.label.replace(/\s\(.*/, '');
            var res = label.length > 4 ? dimension : label;
            // padding is unicode thin-space
            return res ? ('< ' + res + ' >') : '';
        }

        self.updateLabelAndTicks = function(canvasSize, select, cssPrefix) {
            if (svc.plotAxis.allowUpdates) {
                var formatInfo, unit;
                if (self.units) {
                    var d = self.scale.domain();
                    unit = d3.formatPrefix(Math.max(Math.abs(d[0]), Math.abs(d[1])), 0);
                    formatInfo = calcTicks(calcFormat(MAX_TICKS, unit), canvasSize, unit);
                    select('.' + dimension + '-axis-label').text(
                        self.label + (formatInfo.base ? (' - ' + baseLabel()) : '')
                        + ' [' + formatInfo.unit.symbol + self.units + ']');
                }
                else {
                    formatInfo = calcTicks(calcFormat(MAX_TICKS), canvasSize);
                    if (self.label) {
                        select('.' + dimension + '-axis-label').text(
                            self.label + (formatInfo.base ? (' - ' + baseLabel()) : ''));
                    }
                }
                var formattedBase = '';
                if (formatInfo.base) {
                    var label = baseLabel();
                    if (label) {
                        label += ' = ';
                    }
                    else {
                        if (formatInfo.base > 0) {
                            label = '+';
                        }
                    }
                    formattedBase = label + formatInfo.baseFormat(applyUnit(formatInfo.base, unit));
                    formattedBase = formattedBase.replace(/0+$/, '');
                    formattedBase = formattedBase.replace(/0+e/, 'e');
                    if (unit) {
                        formattedBase += unit.symbol + self.units;
                    }
                }
                select('.' + dimension + '-base').text(formattedBase);
            }
            select((cssPrefix || '') + '.' + dimension + '.axis').call(self.svgAxis);
        };
        return self;
    };

});

SIREPO.app.directive('interactiveOverlay', function(plotting, focusPointService, d3Service) {
    return {
        restrict: 'A',
        scope: {
            focusPoint: '=',
            hideFocusPoints: '&',
            plotInfoDelegates: '=',
        },
        template: [
        ].join(''),
        controller: function($scope, $element) {

            var d3self;
            var keyListener;
            var dIndex = 0;

            var self = this;
            self.geometry = {};
            self.geometry.mouseX = 0;
            self.geometry.mouseY = 0;
            self.geometry.isMainFocus = true;

            var delegates = $scope.plotInfoDelegates ? $scope.plotInfoDelegates : [];
            for(dIndex = 0; dIndex < delegates.length; ++dIndex) {
                delegates[dIndex].interface = this;
            }

            d3Service.d3().then(init)
                .catch(function (reason) {
                    angular.noop();
                });

            function init() {

                d3self = d3.selectAll($element);
                d3self
                    .on('mouseover', function() {
                        if (! keyListener) {
                            keyListener = true;
                            d3.select('body').on('keydown', function() {
                                onKeyDown();
                            });
                        }
                    })
                    .on('mouseout', function() {
                        d3.select('body').on('keydown', null);
                        keyListener = false;
                    })
                    .on('mousedown', function() {
                         if($scope.focusPoint) {
                            $scope.focusPoint.data.lastClickX = d3.event[$scope.focusPoint.config.invertAxis ? 'clientY' : 'clientX'];
                        }
                   })
                    .on('click', function() {
                        if (d3.event.defaultPrevented) {
                            // ignore event if drag is occurring
                            return;
                        }

                        // This is to hide the info across all "sibling" plots that this overlay does not know about
                        // Must be defined in the parent directive (plot2d, etc.)
                        $scope.hideFocusPoints();

                        if($scope.focusPoint) {
                            var axisIndex = $scope.focusPoint.config.invertAxis ? 1 : 0;
                            self.geometry.mouseX = d3.mouse(this)[axisIndex];
                            self.geometry.mouseY = d3.mouse(this)[1 - axisIndex];
                            self.geometry.isMainFocus = true;
                            if(focusPointService.updateFocus($scope.focusPoint, self.geometry.mouseX, self.geometry.mouseY)) {
                                for(dIndex = 0; dIndex < delegates.length; ++dIndex) {
                                    delegates[dIndex].showFocusPointInfo(self.geometry);
                                }
                           }
                        }

                    })
                    .on('dblclick', function() {
                        copyToClipboard();
                    });
            }

            function onKeyDown() {
                if(! $scope.focusPoint.data.isActive) {
                    return;
                }
                var keyCode = d3.event.keyCode;
                var shiftFactor = d3.event.shiftKey ? 10 : 1;
                var doUpdate = false;
                self.geometry.isMainFocus = false;
                if(keyCode == 27) { // escape
                    $scope.focusPoint.unset();
                    for(dIndex = 0; dIndex < delegates.length; ++dIndex) {
                        delegates[dIndex].hideFocusPointInfo();
                    }
               }
                if(keyCode == 37 || keyCode == 40) { // left & down
                    $scope.focusPoint.move(-1 * shiftFactor);
                    doUpdate = true;
                    d3.event.preventDefault();
                }
                if(keyCode == 39 || keyCode == 38) { // right & up
                    $scope.focusPoint.move(1 * shiftFactor);
                    doUpdate = true;
                    d3.event.preventDefault();
                }
                if(doUpdate) {
                    if(focusPointService.updateFocusData($scope.focusPoint)) {
                        for(dIndex = 0; dIndex < delegates.length; ++dIndex) {
                            delegates[dIndex].moveFocusPointInfo(self.geometry);
                        }
                    }
                    else {
                        for(dIndex = 0; dIndex < delegates.length; ++dIndex) {
                            delegates[dIndex].hideFocusPointInfo();
                        }
                    }
                }
            }

            function copyToClipboard() {
                var focusHint = select('.focus-hint');
                var focusText = select('.focus-text');
                focusText.style('display', 'none');
                var inputField = $('<input>');
                $('body').append(inputField);
                var fmtText = focusPointService.formatFocusPointData($scope.focusPoint);
                inputField.val(
                    fmtText.xText + ', ' + fmtText.yText + ', ' + fmtText.fwhmText
                ).select();
                try {
                    document.execCommand('copy');
                    focusHint.style('display', null);
                    focusHint.text('Copied to clipboard');
                    setTimeout(function () {
                        focusHint.style('display', 'none');
                        focusText.style('display', null);
                    }, 1000);
                }
                catch (e) {
                }
                inputField.remove();
            }

            function select(selector) {
                var e = d3.select(d3self.node().parentNode);
                return e.select(selector);
            }
        },
    };
});

SIREPO.app.directive('focusCircle', function(plotting, focusPointService, d3Service) {
    return {
        restrict: 'A',
        scope: {
            focusPoint: '=',
            plotInfoDelegate: '=',
        },
        template: [
            '<circle r="6"></circle>',
        ].join(''),
        controller: function($scope, $element) {

            var d3self;
            if( $scope.plotInfoDelegate) {
                $scope.plotInfoDelegate.showFocusPointInfo = showFocusCircle;
                $scope.plotInfoDelegate.moveFocusPointInfo = moveFocusCircle;
                $scope.plotInfoDelegate.hideFocusPointInfo = hideFocusCircle;
            }
            d3Service.d3().then(init)
                .catch(function (reason) {
                    angular.noop();
                });

            var defaultCircleSize;

            function init() {
                d3self = d3.selectAll($element);
            }

            function showFocusCircle(geometry) {

                if(! geometry) {
                    geometry = $scope.plotInfoDelegate.interface.geometry;
                }
                var isMainFocus = geometry.isMainFocus;
                d3self.style('display', null);
                if(! focusPointService.updateFocusData($scope.focusPoint)) {
                    hideFocusCircle();
                    return;
                }
                var circle = d3self.select('circle');
                if (isMainFocus) {
                    if (! defaultCircleSize) {
                        defaultCircleSize = circle.attr('r');
                    }
                    circle.attr('r', defaultCircleSize);
                }
                else {
                    circle.attr('r', defaultCircleSize - 2);
                }
                var mouseCoords = focusPointService.dataCoordsToMouseCoords($scope.focusPoint);
                d3self.attr('transform', 'translate(' + mouseCoords.x + ',' + mouseCoords.y + ')');
                $scope.plotInfoDelegate.showFocusPointInfoComplete($scope.focusPoint);
            }
            function moveFocusCircle() {
                if (focusPointService.updateFocusData($scope.focusPoint)) {
                    showFocusCircle({isMainFocus: false});
                }
                else {
                    hideFocusCircle();
                }
            }
            function hideFocusCircle() {
                d3self.style('display', 'none');
                $scope.plotInfoDelegate.hideFocusPointInfoComplete();
            }

        },
    };
});

SIREPO.app.directive('popupReport', function(plotting, d3Service, focusPointService) {
    return {
        restrict: 'A',
        scope: {
            focusPoint: '=',
            plotInfoDelegate: '=',
        },
        template: [
            '<g class="popup-group">',
                '<g data-is-svg="true" data-ng-drag="true" data-ng-drag-data="focusPoint" data-ng-drag-success="dragDone($data, $event)">',
                    '<g>',
                        '<rect class="report-window" rx="4px" ry="4px" data-ng-attr-width="{{ popupWindowSize().width }}" data-ng-attr-height="{{ popupWindowSize().height }}" x="0" y="0"></rect>',
                        '<g>',
                            '<rect class="report-window-title-bar" data-ng-attr-width="{{ popupTitleSize().width }}" data-ng-attr-height="{{ popupTitleSize().height }}" x="1" y="1"></rect>',
                            '<text class="report-window-close close" x="150" y="0" dy="1em" dx="-1em">×</text>',
                        '</g>',
                    '</g>',
                    '<text id="x-text-0" class="focus-text-popup" x="0" data-ng-attr-y="{{ popupTitleSize().height }}" dy="1.1em" dx="0.5em"></text>',
                    '<text id="y-text-0" class="focus-text-popup" x="0" data-ng-attr-y="{{ popupTitleSize().height }}" dy="2.2em" dx="0.5em"></text>',
                    '<text id="fwhm-text-0" class="focus-text-popup" x="0" data-ng-attr-y="{{ popupTitleSize().height }}" dy="3.3em" dx="0.5em"></text>',
                '</g>',
            '</g>',
        ].join(''),
        controller: function($scope, $element) {

            // TODO(mvk): allow resize?

            var d3self;
            var group;
            var rptWindow;
            var dgElement;

            var popupMargin = 4;

            var moveEventDetected = false;
            var didDragToNewPositon = false;

            if( $scope.plotInfoDelegate) {
                $scope.plotInfoDelegate.showFocusPointInfo = showPopup;
                $scope.plotInfoDelegate.hideFocusPointInfo = hidePopup;
                $scope.plotInfoDelegate.moveFocusPointInfo = movePopup;
            }

            var axisIndex = $scope.invertAxis ? 1 : 0;
            $scope.plotting = plotting;

            d3Service.d3().then(init)
                .catch(function (reason) {
                    angular.noop();
                });

            function init() {

                d3self = d3.selectAll($element);
                group = d3self.select('.popup-group');
                rptWindow = group.select('.report-window');
                dgElement = angular.element(group.select('g').node());

                d3self.select('.popup-group .report-window-close')
                    .on('click', closePopup);
            }

            $scope.overlaySize = function() {
                return {
                    width: parseInt(d3self.attr('width')),
                    height: parseInt(d3self.attr('height'))
                };
            };
            $scope.popupWindowSize = function() {
                return {
                    width: 150,
                    height: 100
                };
            };
            $scope.popupTitleSize = function () {
                 return {
                    width: $scope.popupWindowSize().width - 2,
                    height: 24
                };
            };

            // ngDraggable interprets even clicks as starting a drag event - we don't want to do transforms later
            // unless we really moved it
            $scope.$on('draggable:move', function(event, obj) {
                // all popups will hear this event, so confine logic to this one
                if(obj.element[0] == dgElement[0]) {
                    moveEventDetected = true;
                }
            });
            $scope.dragDone = function($data, $event) {
                didDragToNewPositon = true;
                var xf = currentXform();
                if(moveEventDetected) {
                    showPopup({mouseX: xf.tx + $event.tx, mouseY: xf.ty + $event.ty}, true);
                }
                moveEventDetected = false;
            };


            function showPopup(geometry, isReposition) {
                if(! geometry) {
                    return true;
                }
                refreshText();
                d3self.style('display', 'block');
                if (didDragToNewPositon && ! isReposition) {
                    return true;
                }
                var x = geometry.mouseX;
                var y = geometry.mouseY;

                // set position and size
                var newX = Math.max(popupMargin, x);
                var newY = Math.max(popupMargin, y);

                var reportWidth = parseFloat(d3self.attr('width'));
                var reportHeight = parseFloat(d3self.attr('height'));
                var tbw = parseFloat(rptWindow.attr('width'));
                var tbh = parseFloat(rptWindow.attr('height'));
                var bw = rptWindow.style('stroke-width');
                var borderWidth = parseFloat(bw.substring(0, bw.indexOf('px')));

                newX = Math.min(reportWidth - tbw - popupMargin, newX);
                newY = Math.min(reportHeight - tbh - popupMargin, newY);
                group.attr('transform', 'translate(' + newX + ',' + newY + ')');
                group.select('.report-window-title-bar').attr('width', tbw - 2 * borderWidth);
                return true;
            }
            function refreshText() {
                // format data
                // TODO(mvk): repeat when multiple axes are ready
                var fmtText = focusPointService.formatFocusPointData($scope.focusPoint);
                d3self.select('.popup-group #x-text-0').text(fmtText.xText);
                d3self.select('.popup-group #y-text-0').text(fmtText.yText);
                d3self.select('.popup-group #fwhm-text-0').text(fmtText.fwhmText);
            }
            // move in response to arrow keys - but if user dragged the window we assume they don't
            // want it to track the focus point
            function movePopup() {
                if(! didDragToNewPositon) {
                    var mouseCoords = focusPointService.dataCoordsToMouseCoords($scope.focusPoint);
                    var xf = currentXform();
                    if(! isNaN(xf.tx) && ! isNaN(xf.ty)) {
                        showPopup({mouseX: mouseCoords.x, mouseY: xf.ty}, true);
                    }
                }
                else {
                    refreshText();
                }
            }
            function currentXform(d3Element) {
                if(! d3Element) {
                    d3Element = group;
                }
                var xform = {
                    tx: NaN,
                    ty: NaN
                };
                var reportTransform = d3Element.attr('transform');
                if (reportTransform) {
                    var xlateIndex = reportTransform.indexOf('translate(');
                    if (xlateIndex >= 0) {
                        var tmp = reportTransform.substring('translate('.length);
                        var coords = tmp.substring(0, tmp.indexOf(')'));
                        var delimiter = coords.indexOf(',') >= 0 ? ',' : ' ';
                        xform.tx = parseFloat(coords.substring(0, coords.indexOf(delimiter)));
                        xform.ty = parseFloat(coords.substring(coords.indexOf(delimiter) + 1));
                    }
                }
                return xform;
            }

            function closePopup() {
                didDragToNewPositon = false;
                hidePopup();
            }

            function hidePopup() {
                d3self.style('display', 'none');
                $scope.focusPoint.unset();
                $scope.plotInfoDelegate.hideFocusPointInfoComplete();
            }
        },
    };
});

SIREPO.app.directive('plot2d', function(plotting, utilities, focusPointService, layoutService) {
    return {
        restrict: 'A',
        scope: {
            modelName: '@',
        },
        templateUrl: '/static/html/plot2d.html' + SIREPO.SOURCE_CACHE_KEY,
        controller: function($scope) {
            var ASPECT_RATIO = 4.0 / 7;
            $scope.margin = {top: 50, right: 10, bottom: 50, left: 75};
            $scope.width = $scope.height = 0;
            $scope.dataCleared = true;

            $scope.focusPoint = null;

            $scope.popupDelegate = focusPointService.setupInfoDelegate(null, function() {
                $scope.focusCircleDelegate.hideFocusPointInfo();
            });
            $scope.focusCircleDelegate = focusPointService.setupInfoDelegate();

            if(! $scope.plotInfoDelegates) {
                $scope.plotInfoDelegates = [];
            }
            $scope.plotInfoDelegates.push($scope.popupDelegate);
            $scope.plotInfoDelegates.push($scope.focusCircleDelegate);

            var graphLine, points, zoom;
            var axes = {
                x: layoutService.plotAxis($scope.margin, 'x', 'bottom', refresh, utilities),
                y: layoutService.plotAxis($scope.margin, 'y', 'left', refresh, utilities),
           };

            function refresh() {
                if (! axes.x.domain) {
                    return;
                }
                if (layoutService.plotAxis.allowUpdates) {
                    var width = parseInt(select().style('width')) - $scope.margin.left - $scope.margin.right;
                    if (! points || isNaN(width)) {
                        return;
                    }
                    $scope.width = width;
                    $scope.height = ASPECT_RATIO * $scope.width;
                    select('svg')
                        .attr('width', $scope.width + $scope.margin.left + $scope.margin.right)
                        .attr('height', $scope.height + $scope.margin.top + $scope.margin.bottom);
                    axes.x.scale.range([0, $scope.width]);
                    axes.y.scale.range([$scope.height, 0]);
                    axes.x.grid.tickSize(-$scope.height);
                    axes.y.grid.tickSize(-$scope.width);
                }
                if (plotting.trimDomain(axes.x.scale, axes.x.domain)) {
                    select('.overlay').attr('class', 'overlay mouse-zoom');
                    axes.y.scale.domain(axes.y.domain).nice();
                }
                else {
                    select('.overlay').attr('class', 'overlay mouse-move-ew');
                    plotting.recalculateDomainFromPoints(axes.y.scale, points[0], axes.x.scale.domain());
                }
                resetZoom();
                select('.overlay').call(zoom);
                plotting.refreshConvergencePoints(select, '.plot-viewport', graphLine);
                focusPointService.refreshFocusPoint($scope.focusPoint, $scope.plotInfoDelegates);
                $.each(axes, function (dim, axis) {
                    axis.updateLabelAndTicks({
                        width: $scope.width,
                        height: $scope.height,
                    }, select);
                    axis.grid.ticks(axis.tickCount);
                    select('.' + dim + '.axis.grid').call(axis.grid);
                });
            }

            function resetZoom() {
                zoom = axes.x.createZoom($scope);
            }
            function select(selector) {
                var e = d3.select($scope.element);
                return selector ? e.select(selector) : e;
            }

            $scope.clearData = function () {
                $scope.dataCleared = true;
                axes.x.domain = null;
            };

            $scope.destroy = function () {
                zoom.on('zoom', null);
                $('.overlay').off();
            };

            $scope.init = function () {
                select('svg').attr('height', plotting.initialHeight($scope));
                $.each(axes, function (dim, axis) {
                    axis.init();
                    axis.grid = axis.createAxis();
                });
                graphLine = d3.svg.line()
                    .x(function (d) {
                        return axes.x.scale(d[0]);
                    })
                    .y(function (d) {
                        return axes.y.scale(d[1]);
                    });
                $scope.focusPoint = focusPointService.setupFocusPoint(axes.x.scale, axes.y.scale, false, axes.x);
                resetZoom();
            };

            $scope.load = function (json) {
                $scope.dataCleared = false;
                var xPoints = json.x_points
                    ? json.x_points
                    : plotting.linspace(json.x_range[0], json.x_range[1], json.points.length);
                $scope.xRange = json.x_range;
                var xdom = [json.x_range[0], json.x_range[1]];
                if (!(axes.x.domain && axes.x.domain[0] == xdom[0] && axes.x.domain[1] == xdom[1])) {
                    axes.x.domain = xdom;
                    points = [];
                    axes.x.scale.domain(xdom);
                }
                if (!SIREPO.PLOTTING_SHOW_CONVERGENCE_LINEOUTS) {
                    points = [];
                }
                var ymin = d3.min(json.points);
                if (ymin > 0) {
                    ymin = 0;
                }
                axes.y.domain = [ymin, d3.max(json.points)];
                axes.y.scale.domain(axes.y.domain).nice();
                var p = d3.zip(xPoints, json.points);
                plotting.addConvergencePoints(select, '.plot-viewport', points, p);

                focusPointService.loadFocusPoint($scope.focusPoint, p, true, $scope.plotInfoDelegates);
                $.each(axes, function (dim, axis) {
                    axis.parseLabelAndUnits(json[dim + '_label']);
                    select('.' + dim + '-axis-label').text(json[dim + '_label']);
                });
                select('.main-title').text(json.title);
                select('.sub-title').text(json.subtitle);
                $scope.resize();
            };

            $scope.resize = function () {
                if (select().empty()) {
                    return;
                }
                refresh();
            };

            // unset focus point and hide info
            $scope.hideFocusPoints = function() {
                $scope.focusPoint.unset();
                for(var dIndex = 0; dIndex < $scope.plotInfoDelegates.length; ++dIndex) {
                    $scope.plotInfoDelegates[dIndex].hideFocusPointInfo();
                }
            };

        },
        link: function link(scope, element) {
            plotting.linkPlot(scope, element);
        },
    };
});

SIREPO.app.directive('plot3d', function(appState, plotting, utilities, focusPointService, layoutService) {
    return {
        restrict: 'A',
        scope: {
            modelName: '@',
        },
        templateUrl: '/static/html/plot3d.html' + SIREPO.SOURCE_CACHE_KEY,
        controller: function($scope) {

            var MIN_PIXEL_RESOLUTION = 10;
            $scope.margin = {
                top: 50,
                left: 50,
                right: 45,
                bottom: 30,
            };
            $scope.pad = 10;
            $scope.noLabelPad = -18;
            // will be set to the correct size in resize()
            $scope.canvasSize = 0;
            $scope.titleCenter = 0;
            $scope.subTitleCenter = 0;
            $scope.rightPanelWidth = $scope.bottomPanelHeight = 55;
            $scope.dataCleared = true;
            $scope.wantCrossHairs = ! SIREPO.PLOTTING_SUMMED_LINEOUTS;
            $scope.focusTextCloseSpace = 18;

            $scope.focusCircleDelegateBottom = focusPointService.setupInfoDelegate(showFocusPointText, hideFocusPointText);
            $scope.focusCircleDelegateRight = focusPointService.setupInfoDelegate(showFocusPointText, hideFocusPointText);

            if(! $scope.plotInfoDelegatesBottom) {
                $scope.plotInfoDelegatesBottom = [];
            }
            if(! $scope.plotInfoDelegatesRight) {
                $scope.plotInfoDelegatesRight = [];
            }
            $scope.plotInfoDelegatesBottom.push($scope.focusCircleDelegateBottom);
            $scope.plotInfoDelegatesRight.push($scope.focusCircleDelegateRight);


            var canvas, ctx, fullDomain, heatmap, lineOuts, prevDomain, xyZoom;
            var cacheCanvas, imageData;
            var axes = {
                x: layoutService.plotAxis($scope.margin, 'x', 'bottom', refresh, utilities),
                y: layoutService.plotAxis($scope.margin, 'y', 'right', refresh, utilities),
                bottomY: layoutService.plotAxis($scope.margin, 'y', 'left', refresh, utilities),
                rightX: layoutService.plotAxis($scope.margin, 'x', 'bottom', refresh, utilities),
            };
            var colorRange = plotting.createColorRange();

            var cursorShape = {
                '11': 'mouse-move-ew',
                '10': 'mouse-move-e',
                '01': 'mouse-move-w',
                '22': 'mouse-move-ns',
                '20': 'mouse-move-n',
                '02': 'mouse-move-s',
            };

            function adjustZoomToCenter(scale) {
                // if the domain is almost centered on 0.0 (within 10%) adjust zoom and offset to center
                var domain = scale.domain();
                if (domain[0] < 0 && domain[1] > 0) {
                    var width = domain[1] - domain[0];
                    var diff = (domain[0] + domain[1]) / width;
                    if (diff > 0 && diff < 0.1) {
                        domain[1] = -domain[0];
                    }
                    else if (diff > -0.1 && diff < 0) {
                        domain[0] = -domain[1];
                    }
                    else {
                        return;
                    }
                    scale.domain(domain);
                }
            }

            function centerTitle() {
                $scope.titleCenter = centerNode(select('text.main-title').node(), $scope.titleCenter);
            }
            function centerSubTitle() {
                $scope.subTitleCenter = centerNode(select('text.sub-title').node(), $scope.subTitleCenter);
            }
            function centerNode(node, defaultCtr) {
                // center the node over the image; if node is too large, center it over whole plot
                if (node && ! (node.style && node.style.display == 'none')) {
                    var width = node.getBBox().width;
                    var ctr = $scope.canvasSize / 2;
                    if (width > $scope.canvasSize) {
                        ctr += $scope.rightPanelWidth / 2;
                    }
                    return ctr;
                }
                if(defaultCtr) {
                    return defaultCtr;
                }
                return 0;
            }

            function clipDomain(scale, axisName) {
                var domain = fullDomain[axisName == 'x' ? 0 : 1];
                var domainSize = domain[1] - domain[0];
                var fudgeFactor = domainSize * 0.001;
                var d = scale.domain();
                var canMove = axisName == 'x' ? [1, 1] : [2, 2];

                if (d[0] - domain[0] <= fudgeFactor) {
                    canMove[0] = 0;
                    d[1] -= d[0] - domain[0];
                    d[0] = domain[0];
                }
                if (domain[1] - d[1] <= fudgeFactor) {
                    canMove[1] = 0;
                    d[0] -= d[1] - domain[1];
                    if (d[0] - domain[0] <= fudgeFactor) {
                        canMove[0] = 0;
                        d[0] = domain[0];
                    }
                    d[1] = domain[1];
                }
                scale.domain(d);
                var cursorKey = '' + canMove[0] + canMove[1];
                var className = 'mouse-rect-' + axisName;
                select('rect.' + className).attr('class', className + ' ' + (cursorShape[cursorKey] || 'mouse-zoom'));
                return canMove[0] + canMove[1];
            }

            function sumRegion(isWidth, bottom, top, left, right) {
                var points = [];
                var max = isWidth ? right : top;
                for (var i = 0; i <= max; i++) {
                    points[i] = 0;
                }
                for (i = bottom; i <= top; i++) {
                    for (var j = left; j <= right; j++) {
                        var index = isWidth ? j : i;
                        points[index] += heatmap[axes.y.values.length - 1 - i][j];
                    }
                }
                return points;
            }

            function drawBottomPanelCut() {
                var row;
                var yBottom = axes.y.indexScale(axes.y.scale.domain()[0]);
                var yTop = axes.y.indexScale(axes.y.scale.domain()[1]);
                var yv = Math.round(yBottom + (yTop - yBottom) / 2);
                if (SIREPO.PLOTTING_SUMMED_LINEOUTS) {
                    row = sumRegion(
                        true,
                        Math.floor(yBottom + 0.5),
                        Math.ceil(yTop - 0.5),
                        Math.floor(axes.x.indexScale(axes.x.scale.domain()[0])),
                        Math.ceil(axes.x.indexScale(axes.x.scale.domain()[1])));
                }
                else {
                    row = heatmap[axes.y.values.length - 1 - yv];
                }
                var points = d3.zip(axes.x.values, row);
                plotting.recalculateDomainFromPoints(axes.bottomY.scale, points, axes.x.scale.domain());
                drawLineout('x', yv, points, axes.x.cutLine);
                focusPointService.loadFocusPoint($scope.focusPointX, points, true, $scope.plotInfoDelegatesBottom);
            }

            function drawLineout(axis, key, points, cutLine) {
                if (! lineOuts[axis] || ! SIREPO.PLOTTING_SHOW_CONVERGENCE_LINEOUTS) {
                    lineOuts[axis] = {};
                }
                var axisClass = axis == 'x' ? '.bottom-panel' : '.right-panel';
                if (lineOuts[axis][key]) {
                    if (! appState.deepEquals(points, lineOuts[axis][key][0])) {
                        lineOuts[axis][key] = plotting.addConvergencePoints(select, axisClass, lineOuts[axis][key], points);
                    }
                }
                else {
                    lineOuts[axis] = {};
                    lineOuts[axis][key] = plotting.addConvergencePoints(select, axisClass, [], points);
                }
                plotting.refreshConvergencePoints(select, axisClass, cutLine);
            }

            function drawRightPanelCut() {
                var xLeft = axes.x.indexScale(axes.x.scale.domain()[0]);
                var xRight = axes.x.indexScale(axes.x.scale.domain()[1]);
                var xv = Math.round(xLeft + (xRight - xLeft) / 2);
                var points;

                if (SIREPO.PLOTTING_SUMMED_LINEOUTS) {
                    points = d3.zip(axes.y.values, sumRegion(
                        false,
                        Math.floor(axes.y.indexScale(axes.y.scale.domain()[0])),
                        Math.ceil(axes.y.indexScale(axes.y.scale.domain()[1])),
                        Math.floor(xLeft + 0.5),
                        Math.ceil(xRight - 0.5)));
                }
                else {
                    points = heatmap.map(function (v, i) {
                        return [axes.y.values[axes.y.values.length - 1 - i], v[xv]];
                    });
                }
                plotting.recalculateDomainFromPoints(axes.rightX.scale, points, axes.y.scale.domain(), true);
                drawLineout('y', xv, points, axes.y.cutLine);
                focusPointService.loadFocusPoint($scope.focusPointY, points, true, $scope.plotInfoDelegatesRight);
            }

            function exceededMaxZoom(scale, axisName) {
                var domain = fullDomain[axisName == 'x' ? 0 : 1];
                var domainSize = domain[1] - domain[0];
                var d = scale.domain();
                var pixels = (axisName == 'x' ? axes.x.values : axes.y.values).length * (d[1] - d[0]) / domainSize;
                return pixels < MIN_PIXEL_RESOLUTION;
            }

            function refresh() {
                if (! fullDomain) {
                    return;
                }
                if (layoutService.plotAxis.allowUpdates) {
                    var width = parseInt(select().style('width')) - $scope.margin.left - $scope.margin.right - $scope.pad;
                    if (! heatmap || isNaN(width)){
                        return;
                    }
                    var canvasSize = 2 * width / 3;
                    $scope.canvasSize = canvasSize;
                    $scope.bottomPanelHeight = 2 * canvasSize / 5 + $scope.pad + $scope.margin.bottom;
                    $scope.rightPanelWidth = canvasSize / 2 + $scope.pad + $scope.margin.right;
                    axes.x.scale.range([0, canvasSize]);
                    axes.y.scale.range([canvasSize, 0]);
                    axes.bottomY.scale.range([$scope.bottomPanelHeight - $scope.pad - $scope.margin.bottom - 1, 0]);
                    axes.rightX.scale.range([0, $scope.rightPanelWidth - $scope.pad - $scope.margin.right]);
                }
                if (prevDomain && (exceededMaxZoom(axes.x.scale, 'x') || exceededMaxZoom(axes.y.scale, 'y'))) {
                    restoreDomain(axes.x.scale, prevDomain[0]);
                    restoreDomain(axes.y.scale, prevDomain[1]);
                }
                if (clipDomain(axes.x.scale, 'x') + clipDomain(axes.y.scale, 'y')) {
                    select('rect.mouse-rect-xy').attr('class', 'mouse-rect-xy mouse-move');
                }
                else {
                    select('rect.mouse-rect-xy').attr('class', 'mouse-rect-xy mouse-zoom');
                }
                plotting.drawImage(axes.x.scale, axes.y.scale, $scope.canvasSize, $scope.canvasSize, axes.x.values, axes.y.values, canvas, cacheCanvas, true);
                drawBottomPanelCut();
                drawRightPanelCut();

                axes.x.updateLabelAndTicks({
                    height: $scope.bottomPanelHeight,
                    width: $scope.canvasSize,
                }, select, '.bottom-panel ');
                axes.y.updateLabelAndTicks({
                    width: $scope.rightPanelWidth,
                    height: $scope.canvasSize,
                }, select, '.right-panel ');
                axes.bottomY.updateLabelAndTicks({
                    height: $scope.bottomPanelHeight,
                    width: $scope.canvasSize,
                }, select, '.bottom-panel ');
                axes.rightX.updateLabelAndTicks({
                    width: $scope.rightPanelWidth - $scope.margin.right,
                    height: $scope.canvasSize,
                }, select, '.right-panel ');

                if (layoutService.plotAxis.allowUpdates) {
                    axes.x.grid.ticks(axes.x.tickCount);
                    axes.y.grid.ticks(axes.y.tickCount);
                    axes.x.grid.tickSize(- $scope.canvasSize - $scope.bottomPanelHeight + $scope.margin.bottom); // tickLine == gridline
                    axes.y.grid.tickSize(- $scope.canvasSize - $scope.rightPanelWidth + $scope.margin.right); // tickLine == gridline
                }
                resetZoom();
                select('.mouse-rect-xy').call(xyZoom);
                select('.mouse-rect-x').call(axes.x.zoom);
                select('.mouse-rect-y').call(axes.y.zoom);
                select('.right-panel .x.axis').call(axes.rightX.svgAxis);
                select('.x.axis.grid').call(axes.x.grid);
                select('.y.axis.grid').call(axes.y.grid);
                focusPointService.refreshFocusPoint($scope.focusPointX, $scope.plotInfoDelegatesBottom);
                focusPointService.refreshFocusPoint($scope.focusPointY, $scope.plotInfoDelegatesRight);
                prevDomain = [
                    axes.x.scale.domain(),
                    axes.y.scale.domain(),
                ];
                centerTitle();
                centerSubTitle();
            }

            function resetZoom() {
                xyZoom = axes.x.createZoom($scope).y(axes.y.scale);
                axes.x.zoom = axes.x.createZoom($scope);
                axes.y.zoom = axes.y.createZoom($scope);
            }

            function restoreDomain(scale, oldValue) {
                var d = scale.domain();
                d[0] = oldValue[0];
                d[1] = oldValue[1];
            }

            function showFocusPointText(focusPoint) {
                select('.focus-text-close').style('display', 'block');

                var focusText = select('.focus-text');
                var fmtTxt = focusPointService.formatFocusPointData(focusPoint);
                var xyfText = fmtTxt.xText + ', ' + fmtTxt.yText;
                if(fmtTxt.fwhmText !== '') {
                    xyfText = xyfText + ', ' + fmtTxt.fwhmText;
                }
                if(focusPoint == $scope.focusPointX) {
                    xyfText = xyfText + ' ↓';
                }
                if(focusPoint == $scope.focusPointY) {
                    xyfText = xyfText + ' →';
                }
                select('.sub-title').style('display', 'none');
                focusText.text(xyfText);
                resizefocusPointText();
            }
            function resizefocusPointText() {
                var maxSize = 14;
                var minSize = 9;
                var focusText = select('.focus-text');
                var fs = focusText.style('font-size');

                var currentFontSize = parseFloat(fs.substring(0, fs.indexOf('px')));
                var newFontSize = currentFontSize;

                var textWidth = focusText.node().getComputedTextLength();
                var pct = ($scope.canvasSize - $scope.focusTextCloseSpace) / textWidth;

                newFontSize *= pct;
                newFontSize = Math.max(minSize, newFontSize);
                newFontSize = Math.min(maxSize, newFontSize);
                focusText.style('font-size', newFontSize + 'px');
            }
            function hideFocusPointText() {
                // don't hide text if other plot has focus point
                if(! $scope.focusPointX.data.isActive && ! $scope.focusPointY.data.isActive) {
                    select('.focus-text').text('');
                    select('.focus-text-close').style('display', 'none');
                    select('.sub-title').style('display', 'block');
                }
            }

            function select(selector) {
                var e = d3.select($scope.element);
                return selector ? e.select(selector) : e;
            }

            $scope.clearData = function() {
                $scope.dataCleared = true;
                fullDomain = null;
                lineOuts = {};
            };

            $scope.destroy = function() {
                xyZoom.on('zoom', null);
                axes.x.zoom.on('zoom', null);
                axes.y.zoom.on('zoom', null);
            };

            $scope.init = function() {
                select('svg').attr('height', plotting.initialHeight($scope));
                axes.x.init();
                axes.y.init();
                axes.bottomY.init();
                axes.rightX.init();
                axes.x.indexScale = d3.scale.linear();
                axes.y.indexScale = d3.scale.linear();
                axes.x.grid = axes.x.createAxis();
                axes.y.grid = axes.y.createAxis('left');
                resetZoom();
                canvas = select('canvas').node();
                ctx = canvas.getContext('2d');
                cacheCanvas = document.createElement('canvas');
                axes.x.cutLine = d3.svg.line()
                    .x(function(d) {return axes.x.scale(d[0]);})
                    .y(function(d) {return axes.bottomY.scale(d[1]);});
                axes.y.cutLine = d3.svg.line()
                    .y(function(d) { return axes.y.scale(d[0]);})
                    .x(function(d) { return axes.rightX.scale(d[1]);});

                $scope.focusPointX = focusPointService.setupFocusPoint(axes.x.scale, axes.bottomY.scale, false, axes.x);
                $scope.focusPointY = focusPointService.setupFocusPoint(axes.y.scale, axes.rightX.scale, true, axes.y);

                select('.focus-text-close')
                    .on('click', $scope.hideFocusPoints);
           };

            $scope.load = function(json) {
                prevDomain = null;
                $scope.dataCleared = false;
                heatmap = appState.clone(json.z_matrix).reverse();
                var newFullDomain = [
                    [json.x_range[0], json.x_range[1]],
                    [json.y_range[0], json.y_range[1]],
                ];
                if ((axes.y.values && axes.y.values.length != json.z_matrix.length)
                    || ! appState.deepEquals(fullDomain, newFullDomain)) {
                    fullDomain = newFullDomain;
                    lineOuts = {};
                    axes.x.values = plotting.linspace(fullDomain[0][0], fullDomain[0][1], json.x_range[2]);
                    axes.y.values = plotting.linspace(fullDomain[1][0], fullDomain[1][1], json.y_range[2]);
                    axes.x.scale.domain(fullDomain[0]);
                    axes.x.indexScale.domain(fullDomain[0]);
                    axes.y.scale.domain(fullDomain[1]);
                    axes.y.indexScale.domain(fullDomain[1]);
                    adjustZoomToCenter(axes.x.scale);
                    adjustZoomToCenter(axes.y.scale);
                }
                var xmax = axes.x.values.length - 1;
                var ymax = axes.y.values.length - 1;
                axes.x.indexScale.range([0, xmax]);
                axes.y.indexScale.range([0, ymax]);
                cacheCanvas.width = axes.x.values.length;
                cacheCanvas.height = axes.y.values.length;
                imageData = ctx.getImageData(0, 0, cacheCanvas.width, cacheCanvas.height);
                select('.main-title').text(json.title);
                select('.sub-title').text(json.subtitle);
                axes.x.parseLabelAndUnits(json.x_label);
                select('.x-axis-label').text(json.x_label);
                axes.y.parseLabelAndUnits(json.y_label);
                select('.y-axis-label').text(json.y_label);
                select('.z-axis-label').text(json.z_label);
                var zmin = plotting.min2d(heatmap);
                var zmax = plotting.max2d(heatmap);

                //TODO(pjm): for now, we always want the lower range to be 0
                if (zmin > 0) {
                    zmin = 0;
                }
                axes.bottomY.scale.domain([zmin, zmax]).nice();
                axes.rightX.scale.domain([zmax, zmin]).nice();
                colorRange.setRange(zmin, zmax);
                plotting.initImage(colorRange, heatmap, cacheCanvas, imageData, $scope.modelName);
                $scope.resize();
                $scope.resize();
            };

            $scope.modelChanged = function() {
                // clear lineOuts
                $scope.clearData();
            };

            $scope.resize = function() {
                if (select().empty()) {
                    return;
                }
                refresh();
            };

            $scope.hideFocusPoints = function() {
                $scope.focusPointX.unset();
                $scope.focusPointY.unset();
                var dIndex = 0;
                for(dIndex = 0; dIndex < $scope.plotInfoDelegatesBottom.length; ++dIndex) {
                    $scope.plotInfoDelegatesBottom[dIndex].hideFocusPointInfo();
                }
                for(dIndex = 0; dIndex < $scope.plotInfoDelegatesRight.length; ++dIndex) {
                    $scope.plotInfoDelegatesRight[dIndex].hideFocusPointInfo();
                }
            };


            $scope.$on(SIREPO.PLOTTING_LINE_CSV_EVENT, function(evt, axisName) {
                var keys = Object.keys(lineOuts[axisName]);
                var points = lineOuts[axisName][keys[0]][0];
                var xHeading = select('.' + axisName + '-axis-label').text();
                plotting.exportCSV(
                    xHeading,
                    [xHeading + ' [' + $scope.xunits +']', select('.z-axis-label').text()],
                    points);
            });
        },
        link: function link(scope, element) {
            plotting.linkPlot(scope, element);
        },
    };
});

SIREPO.app.directive('heatmap', function(appState, plotting, utilities, layoutService) {
    return {
        restrict: 'A',
        scope: {
            modelName: '@',
        },
        templateUrl: '/static/html/heatplot.html' + SIREPO.SOURCE_CACHE_KEY,
        controller: function($scope) {
            // will be set to the correct size in resize()
            $scope.canvasSize = {
                width: 0,
                height: 0,
            };
            $scope.dataCleared = true;
            $scope.margin = {top: 40, left: 70, right: 100, bottom: 50};

            var aspectRatio = 1.0;
            var canvas, ctx, heatmap, mouseMovePoint, pointer, zoom;
            var cacheCanvas, imageData;
            var colorbar, colorbarFormat;
            var axes = {
                x: layoutService.plotAxis($scope.margin, 'x', 'bottom', refresh, utilities),
                y: layoutService.plotAxis($scope.margin, 'y', 'left', refresh, utilities),
            };
            var colorRange = plotting.createColorRange();

            function colorbarSize() {
                var maxLength = colorbar.scale().ticks().reduce(function(size, v) {
                    return Math.max(size, colorbarFormat(v).length);
                }, 0);
                var textSize = Math.max(25, maxLength * 12);
                var res = textSize + colorbar.thickness() + colorbar.margin().left;
                colorbar.margin().right = res;
                return res;
            }

            function getRange(values) {
                return [values[0], values[values.length - 1]];
            }

            var mouseMove = utilities.debounce(function() {
                /*jshint validthis: true*/
                if (! heatmap || heatmap[0].length <= 2) {
                    return;
                }
                var point = mouseMovePoint;
                var xRange = getRange(axes.x.values);
                var yRange = getRange(axes.y.values);
                var x0 = axes.x.scale.invert(point[0] - 1);
                var y0 = axes.y.scale.invert(point[1] - 1);
                var x = Math.round((heatmap[0].length - 1) * (x0 - xRange[0]) / (xRange[1] - xRange[0]));
                var y = Math.round((heatmap.length - 1) * (y0 - yRange[0]) / (yRange[1] - yRange[0]));
                pointer.pointTo(heatmap[heatmap.length - 1 - y][x]);
            }, 100);

            function refresh() {
                if (layoutService.plotAxis.allowUpdates) {
                    var width = parseInt(select().style('width')) - $scope.margin.left - $scope.margin.right;
                    if (! heatmap || isNaN(width)) {
                        return;
                    }
                    $scope.canvasSize.width = width;
                    $scope.canvasSize.height = width * aspectRatio;
                    axes.x.scale.range([0, $scope.canvasSize.width]);
                    axes.y.scale.range([$scope.canvasSize.height, 0]);
                    $scope.margin.right = colorbarSize();
                }
                if (plotting.trimDomain(axes.x.scale, getRange(axes.x.values))
                    + plotting.trimDomain(axes.y.scale, getRange(axes.y.values))) {
                    select('.mouse-rect').attr('class', 'mouse-rect mouse-zoom');
                }
                else {
                    select('.mouse-rect').attr('class', 'mouse-rect mouse-move');
                }
                plotting.drawImage(axes.x.scale, axes.y.scale, $scope.canvasSize.width, $scope.canvasSize.height, axes.x.values, axes.y.values, canvas, cacheCanvas, true);
                resetZoom();
                select('.mouse-rect').call(zoom);
                $.each(axes, function(dim, axis) {
                    axis.updateLabelAndTicks($scope.canvasSize, select);
                });
                if (layoutService.plotAxis.allowUpdates) {
                    colorbar.barlength($scope.canvasSize.height).origin([$scope.canvasSize.width + $scope.margin.right, 0]);
                    // must remove the element to reset the margins
                    select('svg.colorbar').remove();
                    pointer = select('.colorbar').call(colorbar);
                }
            }

            function resetZoom() {
                zoom = axes.x.createZoom($scope).y(axes.y.scale);
            }

            function select(selector) {
                var e = d3.select($scope.element);
                return selector ? e.select(selector) : e;
            }

            function setColorScale() {
                colorRange.setRange(plotting.min2d(heatmap), plotting.max2d(heatmap));
                var colorScale = plotting.initImage(colorRange, heatmap, cacheCanvas, imageData, $scope.modelName);
                colorbar.scale(colorScale);
            }

            $scope.clearData = function() {
                $scope.dataCleared = true;
                $scope.prevFrameIndex = -1;
            };

            $scope.destroy = function() {
                $('.mouse-rect').off();
                zoom.on('zoom', null);
            };

            $scope.init = function() {
                select('svg').attr('height', plotting.initialHeight($scope));
                $.each(axes, function(dim, axis) {
                    axis.init();
                });
                resetZoom();
                canvas = select('canvas').node();
                select('.mouse-rect').on('mousemove', function() {
                    // mouseMove is debounced, so save the point before calling
                    mouseMovePoint = d3.mouse(this);
                    mouseMove();
                });
                ctx = canvas.getContext('2d');
                cacheCanvas = document.createElement('canvas');
                colorbarFormat = d3.format('s');
                colorbar = Colorbar()
                    .margin({top: 10, right: 100, bottom: 20, left: 10})
                    .thickness(30)
                    .orient('vertical');
            };

            $scope.load = function(json) {
                $scope.dataCleared = false;
                aspectRatio = json.aspect_ratio || 1.0;
                heatmap = appState.clone(json.z_matrix).reverse();
                select('.main-title').text(json.title);
                select('.sub-title').text(json.subtitle);
                $.each(axes, function(dim, axis) {
                    axis.values = plotting.linspace(json[dim + '_range'][0], json[dim + '_range'][1], json[dim + '_range'][2]);
                    axis.parseLabelAndUnits(json[dim + '_label']);
                    select('.' + dim + '-axis-label').text(json[dim + '_label']);
                    axis.scale.domain(getRange(axis.values));
                });
                cacheCanvas.width = axes.x.values.length;
                cacheCanvas.height = axes.y.values.length;
                imageData = ctx.getImageData(0, 0, cacheCanvas.width, cacheCanvas.height);
                select('.z-axis-label').text(json.z_label);
                select('.frequency-label').text(json.frequency_title);
                setColorScale();
                $scope.resize();
                $scope.resize();
            };

            $scope.modelChanged = function() {
                colorRange.resetEMA();
            };

            $scope.resize = function() {
                if (select().empty()) {
                    return;
                }
                refresh();
            };
        },
        link: function link(scope, element) {
            plotting.linkPlot(scope, element);
        },
    };
});

//TODO(pjm): consolidate plot code with plotting service
SIREPO.app.directive('parameterPlot', function(plotting, utilities, layoutService) {
    return {
        restrict: 'A',
        scope: {
            modelName: '@',
        },
        templateUrl: '/static/html/plot2d.html' + SIREPO.SOURCE_CACHE_KEY,
        controller: function($scope) {
            var ASPECT_RATIO = 4.0 / 7;
            $scope.margin = {top: 50, right: 23, bottom: 50, left: 75};
            $scope.wantLegend = true;
            $scope.width = $scope.height = 0;
            $scope.dataCleared = true;
            var graphLine, zoom;
            var axes = {
                x: layoutService.plotAxis($scope.margin, 'x', 'bottom', refresh, utilities),
                y: layoutService.plotAxis($scope.margin, 'y', 'left', refresh, utilities),
            };

            function recalculateYDomain() {
                var ydom;
                var xdom = axes.x.scale.domain();
                var xPoints = axes.x.points;
                var plots = axes.y.plots;
                for (var i = 0; i < xPoints.length; i++) {
                    var x = xPoints[i];
                    if (x > xdom[1] || x < xdom[0]) {
                        continue;
                    }
                    for (var j = 0; j < plots.length; j++) {
                        var y = plots[j].points[i];
                        if (ydom) {
                            if (y < ydom[0]) {
                                ydom[0] = y;
                            }
                            else if (y > ydom[1]) {
                                ydom[1] = y;
                            }
                        }
                        else {
                            ydom = [y, y];
                        }
                    }
                }
                if (ydom && ydom[0] != ydom[1]) {
                    if (ydom[0] > 0 && axes.y.domain[0] == 0) {
                        ydom[0] = 0;
                    }
                    axes.y.scale.domain(ydom).nice();
                }
            }

            function refresh() {
                if (! axes.x.domain) {
                    return;
                }
                if (layoutService.plotAxis.allowUpdates) {
                    var width = parseInt(select().style('width')) - $scope.margin.left - $scope.margin.right;
                    if (! axes.x.points || isNaN(width)) {
                        return;
                    }
                    $scope.width = width;
                    $scope.height = ASPECT_RATIO * $scope.width;
                    select('svg')
                        .attr('width', $scope.width + $scope.margin.left + $scope.margin.right)
                        .attr('height', $scope.height + $scope.margin.top + $scope.margin.bottom);
                    axes.x.scale.range([0, $scope.width]);
                    axes.y.scale.range([$scope.height, 0]);
                    axes.x.grid.tickSize(-$scope.height);
                    axes.y.grid.tickSize(-$scope.width);
                }
                var xdom = axes.x.scale.domain();
                var zoomWidth = xdom[1] - xdom[0];

                if (plotting.trimDomain(axes.x.scale, axes.x.domain)) {
                    select('.overlay').attr('class', 'overlay mouse-zoom');
                    axes.y.scale.domain(axes.y.domain).nice();
                }
                else {
                    select('.overlay').attr('class', 'overlay mouse-move-ew');
                    recalculateYDomain();
                }
                resetZoom();
                select('.overlay').call(zoom);
                select('.plot-viewport').selectAll('.line').attr('d', graphLine);
                $.each(axes, function(dim, axis) {
                    axis.updateLabelAndTicks({
                        width: $scope.width,
                        height: $scope.height,
                    }, select);
                    axis.grid.ticks(axis.tickCount);
                    select('.' + dim + '.axis.grid').call(axis.grid);
                });
            }

            function resetZoom() {
                zoom = axes.x.createZoom($scope);
            }

            function select(selector) {
                var e = d3.select($scope.element);
                return selector ? e.select(selector) : e;
            }

            $scope.clearData = function() {
                $scope.dataCleared = true;
                axes.x.domain = null;
            };

            $scope.destroy = function() {
                zoom.on('zoom', null);
                $('.overlay').off();
            };

            $scope.init = function() {
                select('svg').attr('height', plotting.initialHeight($scope));
                $.each(axes, function(dim, axis) {
                    axis.init();
                    axis.grid = axis.createAxis();
                });
                graphLine = d3.svg.line()
                    .x(function(d, i) {
                        return axes.x.scale(axes.x.points[i]);
                    })
                    .y(function(d) {
                        return axes.y.scale(d);
                    });
                resetZoom();
            };

            $scope.load = function(json) {
                $scope.dataCleared = false;
                axes.x.points = json.x_points
                    || plotting.linspace(json.x_range[0], json.x_range[1], json.x_range[2] || json.points.length);
                $scope.xRange = json.x_range;
                var xdom = [json.x_range[0], json.x_range[1]];
                axes.x.domain = xdom;
                axes.x.scale.domain(xdom);
                axes.y.domain = [json.y_range[0], json.y_range[1]];
                axes.y.scale.domain(axes.y.domain).nice();
                $.each(axes, function(dim, axis) {
                    axis.parseLabelAndUnits(json[dim + '_label']);
                    select('.' + dim + '-axis-label').text(json[dim + '_label']);
                });
                select('.main-title').text(json.title);
                select('.sub-title').text(json.subtitle);

                // data may contain 2 plots (y1, y2) or multiple plots (plots)
                var plots = json.plots || [
                    {
                        points: json.points[0],
                        label: json.y1_title,
                        color: '#1f77b4',
                    },
                    {
                        points: json.points[1],
                        label: json.y2_title,
                        color: '#ff7f0e',
                    },
                ];

                var viewport = select('.plot-viewport');
                viewport.selectAll('.line').remove();
                var legend = select('.sr-plot-legend');
                legend.selectAll('.sr-plot-legend-item').remove();
                for (var i = 0; i < plots.length; i++) {
                    var plot = plots[i];
                    viewport.append('path')
                        .attr('class', 'line line-color')
                        .style('stroke', plot.color)
                        .datum(plot.points);
                    var item = legend.append('g').attr('class', 'sr-plot-legend-item');
                    item.append('circle')
                        .attr('r', 5)
                        .attr('cx', 8)
                        .attr('cy', 10 + i * 20)
                        .style('stroke', plot.color)
                        .style('fill', plot.color);
                    item.append('text')
                        .attr('class', 'focus-text')
                        .attr('x', 16)
                        .attr('y', 16 + i * 20)
                        .text(plot.label);
                }
                axes.y.plots = plots;
                $scope.margin.top = json.title ? 50 : 20;
                $scope.margin.bottom = 50 + 20 * plots.length;
                $scope.resize();
            };

            $scope.resize = function() {
                if (select().empty()) {
                    return;
                }
                refresh();
            };
        },
        link: function link(scope, element) {
            plotting.linkPlot(scope, element);
        },
    };
});

//TODO(pjm): consolidate plot code with plotting service
SIREPO.app.directive('particle', function(plotting) {
    return {
        restrict: 'A',
        scope: {
            modelName: '@',
        },
        templateUrl: '/static/html/plot2d.html' + SIREPO.SOURCE_CACHE_KEY,
        controller: function($scope) {
            var ASPECT_RATIO = 4.0 / 7;
            $scope.margin = {top: 50, right: 23, bottom: 50, left: 75};
            $scope.width = $scope.height = 0;
            $scope.dataCleared = true;
            var graphLine, xAxis, xAxisGrid, xAxisScale, xDomain, yAxis, yAxisGrid, yAxisScale, yDomain, zoom;

            function refresh() {
                if (! xDomain) {
                    return;
                }
                var xdom = xAxisScale.domain();
                var zoomWidth = xdom[1] - xdom[0];

                if (zoomWidth >= (xDomain[1] - xDomain[0])) {
                    select('.overlay').attr('class', 'overlay mouse-zoom');
                    xAxisScale.domain(xDomain);
                    yAxisScale.domain(yDomain).nice();
                }
                else {
                    select('.overlay').attr('class', 'overlay mouse-move-ew');
                    if (xdom[0] < xDomain[0]) {
                        xAxisScale.domain([xDomain[0], zoomWidth + xDomain[0]]);
                    }
                    if (xdom[1] > xDomain[1]) {
                        xAxisScale.domain([xDomain[1] - zoomWidth, xDomain[1]]);
                    }
                }
                resetZoom();
                select('.overlay').call(zoom);
                select('.x.axis').call(xAxis);
                select('.x.axis.grid').call(xAxisGrid); // tickLine == gridline
                select('.y.axis').call(yAxis);
                select('.y.axis.grid').call(yAxisGrid);
                select('.plot-viewport').selectAll('.line').attr('d', graphLine);
            }

            function resetZoom() {
                zoom = d3.behavior.zoom()
                    .x(xAxisScale)
                    .on('zoom', refresh);
            }

            function select(selector) {
                var e = d3.select($scope.element);
                return selector ? e.select(selector) : e;
            }

            $scope.clearData = function() {
                $scope.dataCleared = true;
                xDomain = null;
            };

            $scope.destroy = function() {
                zoom.on('zoom', null);
                $('.overlay').off();
            };

            $scope.init = function() {
                select('svg').attr('height', plotting.initialHeight($scope));
                xAxisScale = d3.scale.linear();
                yAxisScale = d3.scale.linear();
                xAxis = plotting.createAxis(xAxisScale, 'bottom');
                xAxis.tickFormat(plotting.fixFormat($scope, 'x'));
                xAxisGrid = plotting.createAxis(xAxisScale, 'bottom');
                yAxis = plotting.createAxis(yAxisScale, 'left');
                yAxis.tickFormat(plotting.fixFormat($scope, 'y'));
                yAxisGrid = plotting.createAxis(yAxisScale, 'left');
                graphLine = d3.svg.line()
                    .x(function(d) {
                        return xAxisScale(d[0]);
                    })
                    .y(function(d) {
                        return yAxisScale(d[1]);
                    });
                resetZoom();
            };

            $scope.load = function(json) {
                $scope.dataCleared = false;
                $scope.xRange = json.x_range;
                var xdom = [json.x_range[0], json.x_range[1]];
                xDomain = xdom;
                xAxisScale.domain(xdom);
                yDomain = [json.y_range[0], json.y_range[1]];
                yAxisScale.domain(yDomain).nice();
                var viewport = select('.plot-viewport');
                viewport.selectAll('.line').remove();
                var isFixedX = ! Array.isArray(json.x_points[0]);
                var i;
                var lineClass = json.points.length > 20 ? 'line line-7' : 'line line-0';
                for (i = 0; i < json.points.length; i++) {
                    var p = d3.zip(
                        isFixedX ? json.x_points : json.x_points[i],
                        json.points[i]);
                    viewport.append('path').attr('class', lineClass).datum(p);
                }
                if (json.lost_x && json.lost_x.length) {
                    for (i = 0; i < json.lost_x.length; i++) {
                        viewport.append('path').attr('class', 'line line-reflected').datum(
                            d3.zip(json.lost_x[i], json.lost_y[i]));
                    }
                    // absorbed/reflected legend
                    select('svg')
                        .append('circle').attr('class', 'line-absorbed').attr('r', 5).attr('cx', 8).attr('cy', 10);
                    select('svg')
                        .append('text').attr('class', 'focus-text').attr('x', 16).attr('y', 16)
                        .text('Absorbed');
                    select('svg')
                        .append('circle').attr('class', 'line-reflected').attr('r', 5).attr('cx', 8).attr('cy', 30);
                    select('svg')
                        .append('text').attr('class', 'focus-text').attr('x', 16).attr('y', 36)
                        .text('Reflected');
                }
                select('.y-axis-label').text(plotting.extractUnits($scope, 'y', json.y_label));
                select('.x-axis-label').text(plotting.extractUnits($scope, 'x', json.x_label));
                select('.main-title').text(json.title);
                select('.sub-title').text(json.subtitle);
                $scope.resize();
            };

            $scope.resize = function() {
                if (select().empty()) {
                    return;
                }
                var width = parseInt(select().style('width')) - $scope.margin.left - $scope.margin.right;
                if (! xDomain || isNaN(width)) {
                    return;
                }
                $scope.width = width;
                $scope.height = ASPECT_RATIO * $scope.width;
                select('svg')
                    .attr('width', $scope.width + $scope.margin.left + $scope.margin.right)
                    .attr('height', $scope.height + $scope.margin.top + $scope.margin.bottom);
                plotting.ticks(xAxis, $scope.width, true);
                plotting.ticks(xAxisGrid, $scope.width, true);
                plotting.ticks(yAxis, $scope.height, false);
                plotting.ticks(yAxisGrid, $scope.height, false);
                xAxisScale.range([0, $scope.width]);
                yAxisScale.range([$scope.height, 0]);
                xAxisGrid.tickSize(-$scope.height);
                yAxisGrid.tickSize(-$scope.width);
                refresh();
            };
        },
        link: function link(scope, element) {
            plotting.linkPlot(scope, element);
        },
    };
});
