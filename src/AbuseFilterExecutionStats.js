/**
 * Generates a table with statistics about abuse filters
 * @author: [[User:Helder.wiki]]
 * @tracking: [[Special:GlobalUsage/User:Helder.wiki/Tools/AbuseFilterExecutionStats.js]] ([[File:User:Helder.wiki/Tools/AbuseFilterExecutionStats.js]])
 */
/*jshint browser: true, camelcase: true, curly: true, eqeqeq: true, immed: true, latedef: true, newcap: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, trailing: true, maxlen: 200, evil: true, onevar: true */
/*global jQuery, mediaWiki */
( function ( mw, $ ) {
'use strict';

/* Translatable strings */
mw.messages.set( {
	'afs-page': 'Wikipédia:Filtro_de_edições/Estatísticas',
	'afs-table-caption': 'Estatísticas sobre o tempo de execução dos filtros de edição',
	'afs-table-column-filter': 'Filtro',
	'afs-table-column-actions': 'Ações',
	'afs-table-column-hits': 'Correspondências',
	'afs-table-column-percent': '%',
	'afs-table-column-time': 'Tempo',
	'afs-table-column-conditions': 'Condições',
	'afs-link': 'Estatísticas de execução dos filtros',
	'afs-link-title': 'Gerar uma tabela com estatísticas sobre a execução dos filtros de edição'
} );

var last, stats = [ [ 'Filtro', 'Estatísticas' ] ];

function run(){
	var current = 1;
	function printTable( table ){
		var i, info,
			reStats = /\(abusefilter-edit-status: ([\dm,]+), ([\dm,]+), ([\d.,]+), ([\d.,]+), ([\d.,]+)\)/,
			result = [
				'{| class="wikitable sortable plainlinks"',
				'|+ ' + mw.msg( 'afs-table-caption' ),
				'|-',
				'! data-sort-type="number" | ' + mw.msg( 'afs-table-column-filter' ),
				'! data-sort-type="number" | ' + mw.msg( 'afs-table-column-actions' ),
				'! data-sort-type="number" | ' + mw.msg( 'afs-table-column-hits' ),
				'! data-sort-type="number" | ' + mw.msg( 'afs-table-column-percent' ),
				'! data-sort-type="number" | ' + mw.msg( 'afs-table-column-time' ),
				'! data-sort-type="number" | ' + mw.msg( 'afs-table-column-conditions' )
			].join( '\n' );
		for( i = 1; i < table.length; i++ ){
			info = table[i][1].match( reStats );
			if( info ) {
				result += [
					'\n|-',
					'| [[Special:AbuseFilter/' + table[i][0] + '|' + table[i][0] + ']]',
					'| ' + info[1],
					'| ' + '[{{fullurl:Special:AbuseLog|wpSearchFilter=' +
						table[i][0] + '&limit=' + info[2] + '}} ' + info[2] + ']',
					'| ' + info[3],
					'| ' + info[4],
					'| ' + info[5]
				].join( '\n' );
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
		$.removeSpinner( 'af-status-spinner' );
	}
	function getStatsFor( filter ){
		$.ajax( {
			url: mw.util.wikiGetlink( 'Special:AbuseFilter/' + filter ) + '?uselang=qqx'
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
		} )
		.fail( function(){
			$.removeSpinner( 'af-status-spinner' );
		} );
	}
	$( '#firstHeading' ).injectSpinner( 'af-status-spinner' );
	( new mw.Api() ).get( {
		// /w/api.php?action=query&list=abusefilters&format=json&abflimit=10&abfprop=id
		action: 'query',
		list: 'abusefilters',
		abflimit: 'max',
		abfprop: 'id'
	} )
	.done( function ( data ) {
		last = data.query.abusefilters.length;
		getStatsFor( current );
	} );
}

function addAbuseFilterExecutionStatsLink(){
	$( mw.util.addPortletLink(
		'p-cactions',
		'#',
		mw.msg( 'afs-link' ),
		'ca-AbuseFilterExecutionStatsLink',
		mw.msg( 'afs-link-title' )
	) ).click( function(){
		mw.loader.using( [ 'mediawiki.api.edit', 'jquery.spinner' ], run );
	} );
}

if ( mw.config.get( 'wgPageName' ) === mw.msg( 'afs-page' ) ) {
	$( addAbuseFilterExecutionStatsLink );
}

}( mediaWiki, jQuery ) );