/**
 * Generates a table with statistics about abuse filters
 * @author: [[User:Helder.wiki]]
 * @tracking: [[Special:GlobalUsage/User:Helder.wiki/Tools/AbuseFilterExecutionStats.js]] ([[File:User:Helder.wiki/Tools/AbuseFilterExecutionStats.js]])
 */
/*jshint browser: true, camelcase: true, curly: true, eqeqeq: true, immed: true, latedef: true, newcap: true, noarg: true, noempty: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, trailing: true, laxbreak: true, maxlen: 200, evil: true, onevar: true */
/*global jQuery, mediaWiki */
( function ( mw, $ ) {
'use strict';

/* Translatable strings */
mw.messages.set( {
	'afes-table-caption': 'Estatísticas sobre o tempo de execução dos filtros de edição',
	'afes-table-column-filter': 'Filtro',
	'afes-table-column-actions': 'Ações',
	'afes-table-column-hits': 'Correspondências',
	'afes-table-column-percent': '%',
	'afes-table-column-time': 'Tempo',
	'afes-table-column-conditions': 'Condições',
	'afes-link': 'Estatísticas de execução dos filtros',
	'afes-link-title': 'Gerar uma tabela com estatísticas sobre a execução dos filtros de edição',
	'afes-getting-data-title': 'Obtendo dados...',
	'afes-getting-data' : 'Consultando as estatísticas sobre o filtro $1...'
} );

var last, stats = [ [ 'Filtro', 'Estatísticas' ] ];

function run(){
	var current = 1;
	function printTable( table ){
		var i, info,
			reStats = /\(abusefilter-edit-status: ([\dm,]+), ([\dm,]+), ([\d.,]+), ([\d.,]+), ([\d.,]+)\)/,
			result = [
				'{| class="wikitable sortable plainlinks"',
				'|+ ' + mw.msg( 'afes-table-caption' ),
				'|-',
				'! data-sort-type="number" | ' + mw.msg( 'afes-table-column-filter' ),
				'! data-sort-type="number" | ' + mw.msg( 'afes-table-column-actions' ),
				'! data-sort-type="number" | ' + mw.msg( 'afes-table-column-hits' ),
				'! data-sort-type="number" | ' + mw.msg( 'afes-table-column-percent' ),
				'! data-sort-type="number" | ' + mw.msg( 'afes-table-column-time' ),
				'! data-sort-type="number" | ' + mw.msg( 'afes-table-column-conditions' )
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
		mw.notify(
			mw.msg( 'afes-getting-data', filter ),
			{
				tag: 'stats',
				title: mw.msg( 'afes-getting-data-title' )
			}
		);
		$.ajax( {
			url: mw.util.getUrl( 'Special:AbuseFilter/' + filter, { uselang: 'qqx' } )
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
		mw.msg( 'afes-link' ),
		'ca-AbuseFilterExecutionStatsLink',
		mw.msg( 'afes-link-title' )
	) ).click( function(){
		mw.loader.using( [
			'mediawiki.api.edit',
			'jquery.spinner',
			'mediawiki.notify',
			'mediawiki.notification'
		], run );
	} );
}

if ( mw.config.get( 'wgCanonicalSpecialPageName' ) === 'AbuseFilter'
	|| ( mw.config.get( 'wgDBname' ) === 'ptwiki'
		&& mw.config.get( 'wgPageName' ).indexOf( 'Wikipédia:Filtro_de_edições' ) !== -1
	)
) {
	$( addAbuseFilterExecutionStatsLink );
}

}( mediaWiki, jQuery ) );