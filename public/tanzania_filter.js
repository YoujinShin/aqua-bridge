// ;( function() {

  var getData_t = function () {
      var total_t = 0;
      var total_red_t = 0;
      var total_yellow_t = 0;
      var total_blue_t = 0;

      var count = 0;
      var length = 0;

      $.getJSON('/allfilter', function(temp_data) {

        var data = temp_data.filter;
        length = data.length;



        ////// First Function 
        var getInit = function(callback) {
          var nodes = data.map(function(data) { 
             var pet_b = data.properties["petrifilm_blue"];
             var pet_r = data.properties["petrifilm_red"];
             var col = data.properties["colilert"];

             var clon = data.geometry.coordinates[0];
             var clat = data.geometry.coordinates[1];

             //http://ws.geonames.org/countryCode?lat=49.03&lng=10.2&username=hiyoujin
             var getCountryName = function(mycallback) {
                $.getJSON('http://ws.geonames.org/countryCode', {
                    lat: clat,
                    lng: clon,
                    // username: 'meggonagul',
                    username: 'hiyoujin',
                    type: 'JSON'
                }, mycallback);
             }

             getCountryName(function(result) {
                var countryName = result.countryName;

                if(countryName == 'Tanzania') {
                   if (pet_b > 0 || col == "fluorescence") {  // dangerous
                     total_red_t += 1;
                   } else if (pet_r > 0 || col == "yellow") {  // maybe in danger
                     total_yellow_t += 1;
                   } else {
                     total_blue_t += 1;
                   }
                   total_t += 1;
                 }

                 count += 1;
                 console.log('get init implemented');
                 console.log(countryName);

                 if(count == length) {
                    callback();
                 }
             });

          }); 

        } // end of getInit()

        ///////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////

        ////// Second Function 
        var drawChart = function () {
          var DURATION = 800;
          var DELAY    = 500;

          var r_red_t = total_red_t/ total_t;
          var r_yellow_t = total_yellow_t/ total_t;
          var r_blue_t = total_blue_t/ total_t;

          var data = {
            pieChart  : [
              {
                color       : 'red',
                title       : 'high',
                value       : r_red_t
              },
              {
                color       : 'yellow',
                title       : 'intermediate',
                value       : r_yellow_t
              },
              {
                color       : 'blue',
                title       : 'low',
                value       : r_blue_t
              }
            ]
          };

          // console.log('total: '+ total_t);
          // console.log('red: '+ r_red_t);
          // console.log('yellow: '+ r_yellow_t);
          // console.log('blue: '+ r_blue_t);

          function drawPieChart( elementId, data ) {

            var containerEl = document.getElementById( elementId ),
                width       = containerEl.clientWidth,
                tx = width * 0.1, 
                height      = width * 0.60,
                radius      = Math.min( width, height ) / 2,
                container   = d3.select( containerEl ),
                svg         = container.select( 'svg' )
                                      .attr( 'width', width +tx)
                                      .attr( 'height', height * 1);

            var pie = svg.append( 'g' )
                        .attr(
                          'transform',
                          'translate(' + ( width / 2 + tx + width*0.05 ) + ',' + height / 2 + ')'
                        );
            
            var detailedInfo = svg.append( 'g' )
                                  .attr( 'class', 'pieChart--detailedInformation' );

            var twoPi   = 2 * Math.PI;

            var pieData = d3.layout.pie()
                            .value( function( d ) { return d.value; } );

            var arc = d3.svg.arc()
                            .outerRadius( radius - 20)
                            .innerRadius( 0 );
            
            var pieChartPieces = pie.datum( data )
                                    .selectAll( 'path' )
                                    .data( pieData )
                                    .enter()
                                    .append( 'path' )
                                    .attr( 'class', function( d ) {
                                      return 'pieChart__' + d.data.color;
                                    } )
                                    .attr( 'filter', 'url(#pieChartInsetShadow_t)' )
                                    .attr( 'd', arc )
                                    .each( function() {
                                      this._current = { startAngle: 0, endAngle: 0 }; 
                                    } )
                                    .transition()
                                    .duration( DURATION )
                                    .attrTween( 'd', function( d ) {
                                      var interpolate = d3.interpolate( this._current, d );
                                      this._current = interpolate( 0 );
                            
                                      return function( t ) {
                                        return arc( interpolate( t ) );
                                      };

                                    } )
                                    .each( 'end', function handleAnimationEnd( d ) {
                                      drawDetailedInformation( d.data, this ); 
                                    } );
            
            function drawDetailedInformation ( data, element ) {
              var bBox      = element.getBBox(),
                  infoWidth = width * 0.2,
                  anchor,
                  infoContainer,
                  position;
              

              anchor = 'start';
              position = 'left';

              var ty = 0;
              if(data.color == 'red') {
                ty = 0 ;
              } else if(data.color == 'yellow') {
                ty = 85 ;
              } else if(data.color == 'blue') {
                ty = 170 ;
              }

              infoContainer = detailedInfo.append( 'g' )
                                      .attr( 'width', infoWidth )
                                      .attr(
                                        'transform',
                                        'translate(' + ( tx + 0 ) + ',' + (ty) + ')'
                                      );

              infoContainer.data( [ data.value * 100 ] )
                            .append( 'text' )
                            .text ( '0 %' )
                            .attr( 'class', 'pieChart--detail--percentage' )
                            .attr( 'x', ( position === 'left' ? 0 : infoWidth ) )
                            .attr( 'y', 55 )
                            .attr( 'text-anchor', anchor )
                            .transition()
                            .duration( DURATION )
                            .tween( 'text', function( d ) {
                              var i = d3.interpolateRound(
                                +this.textContent.replace( /\s%/ig, '' ),
                                d
                              );

                              return function( t ) {
                                this.textContent = i( t ) + ' %';
                              };
                            } );
              
              infoContainer.append( 'line' )
                            .attr( 'class', 'pieChart--detail--divider' )
                            .attr( 'x1', 0 )
                            .attr( 'x2', 0 )
                            .attr( 'y1', 0 )
                            .attr( 'y2', 0 )
                            .transition()
                            .duration( DURATION )
                            .attr( 'x2', infoWidth );
              
              infoContainer.data( [ data.description ] ) 
                            .append( 'foreignObject' )
                            .attr( 'width', infoWidth ) 
                            .attr( 'height', 400 )
                            .append( 'xhtml:body' )
                            .attr(
                              'class',
                              'pieChart--detail--textContainer ' + 'pieChart--detail__' + position
                            )
                            .html( data.title );
            }
          }
          drawPieChart(     'pieChart',     data.pieChart );
          console.log('draw chart is implemented');

        } // end of drawChart
        
        getInit(function(result) {
          console.log("callback called");
          drawChart();   
        });

      }); // end of getJSON
  }; // end of getData

  getData_t();

// })();