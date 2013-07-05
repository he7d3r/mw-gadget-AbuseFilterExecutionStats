/**
 * Generates a table with statistics about abuse filters
 * @author: [[User:Helder.wiki]]
 * @tracking: [[Special:GlobalUsage/User:Helder.wiki/Tools/AbuseFilterExecutionStats.js]] ([[File:User:Helder.wiki/Tools/AbuseFilterExecutionStats.js]])
 */
/*jshint browser: true, camelcase: true, curly: true, eqeqeq: true, immed: true, latedef: true, newcap: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, trailing: true, maxlen: 200, evil: true, onevar: true */
/*global jQuery, mediaWiki */
( function ( mw, $ ) {
'use strict';

var last = 112,
	stats = [ [ 'Filtro', 'Estatísticas' ] ];

function run(){
	var current = 1;
	function printTable( table ){
		var i, info,
			reStats = /Das últimas (.+?) ações, este filtro correspondeu com (.+?) \((.+?)\).\nEm média, o seu tempo de execução é de (.+?), e consome (.+?) condições do seu limite de condições./,
			result = '{| class="wikitable sortable"' +
				'\n|+ Estatísticas sobre o tempo de execução dos filtros de edição' +
				'\n|-\n! Filtro !! Ações !! Correspondências !! % !! Tempo !! Condições';
		for( i = 1; i < table.length; i++ ){
			info = table[i][1].match( reStats );
			if( info ) {
				result += '\n|-\n| ' + table[i][0] +
					'\n| ' + info[1] +
					'\n| ' + info[2] +
					'\n| ' + info[3] +
					'\n| ' + info[4] +
					'\n| ' + info[5];
			} else {
				result += '\n|-\n| ' + table[i][0] + '|| || || || || ';
			}
		}
		result += '\n|}';
		$( '#mw-content-text' )
			.empty()
			.append(
				$( '<pre>' ).text( result )
			);
	}
	function getStatsFor( filter ){
		$.ajax( {
			url: mw.util.wikiGetlink( 'Especial:Filtro_de_abusos/' + filter )
		} )
		.done( function( data ){
			var $data = $( data ),
				id = $data.find( '#mw-abusefilter-edit-id' )
					.find( '.mw-input' )
					.text();
			stats.push( [
				id,
				$data.find( '#mw-abusefilter-edit-status-label' )
					.find( '.mw-input' )
					.text()
			] );
			if ( current === last ){
				printTable( stats );
			} else {
				current += 1;
				getStatsFor( current );
			}
		} );
	}
	getStatsFor( current );
}

function addAbuseFilterExecutionStatsLink(){
	$( mw.util.addPortletLink(
		'p-cactions',
		'#',
		'Estatísticas de execução dos filtros',
		'ca-AbuseFilterExecutionStatsLink',
		'Gerar uma tabela com estatísticas sobre a execução dos filtros de edição'
	) ).click( run );
}

if ( mw.config.get( 'wgPageName' ) === 'Wikipédia:Filtro_de_edições/Estatísticas' ) {
	$( addAbuseFilterExecutionStatsLink );
}

}( mediaWiki, jQuery ) );