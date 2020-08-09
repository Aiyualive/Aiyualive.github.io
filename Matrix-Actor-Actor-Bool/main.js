Promise.all([
	d3.csv('PreprocessedData.csv'),
	d3.csv('Cluster.csv', row => +Object.values(row)[0]),
]).then(d => {
	let [data, cluster] = d
	const name = data.columns // Name of everyone
	data = data.map(row => Object.values(row).map(item => +item)) // We need an integer matrix

	const body = d3.select('body')
	const svg = body.append('svg')
	const width = +getComputedStyle(svg.node()).width.replace('px', '')
	const height = +getComputedStyle(svg.node()).height.replace('px', '')
	const margin = 75
	const order = {
		name: d3.range(data.length).sort((a, b) => d3.ascending(name[a], name[b])),
		frequency: d3.range(data.length), // Original data order
		cluster: d3.range(data.length).sort((a, b) => d3.ascending(cluster[a], cluster[b]) || d3.ascending(a, b)),
	}
	const scaleBand = d3.scaleBand().domain(order.name).range([0, width - 2 * margin])
	const scaleColor = d3.scaleOrdinal(d3.schemeTableau10)
	const g = svg.append('g').classed('graph', true)
		.attr('transform', `translate(${1.5 * margin}, ${1.5 * margin})`)
	const row = g.selectAll('g.row').data(data).join('g').classed('row', true)
		.attr('transform', (_, i) => `translate(0, ${scaleBand(i)})`)
	row.append('text')
		.attr('x', -5)
		.text((_, i) => name[i])
	const column = g.selectAll('g.column').data(data).join('g').classed('column', true)
		.attr('transform', (_, i) => `translate(${scaleBand(i)}) rotate(-90)`)
	column.append('text')
		.attr('x', 5)
		.text((_, i) => name[i])

	row.each(function (d, i) {
		d3.select(this).selectAll('rect').data(d).join('rect').classed('cell', true)
			.attr('x', (_, j) => scaleBand(j))
			.attr('width', scaleBand.bandwidth())
			.attr('height', scaleBand.bandwidth())
			.attr('fill', (d, j) => d < 2 ? 'none' : cluster[i] === cluster[j] ? scaleColor(cluster[i]) : '#444444')
	})

	d3.select('select').on('change', function () {
		const scaleOld = scaleBand.copy()
		const t = svg.transition().duration(3000)
		const scaleDelay = 5
		scaleBand.domain(order[this.value])
		const funcDelay = (_, i) => Math.abs(scaleOld(i) - scaleBand(i)) * scaleDelay
		// const funcDelay = (_, i) => scaleBand(i) * scaleDelay
		t.selectAll('.row')
			.delay(funcDelay)
			.attr('transform', (_, i) => `translate(0, ${scaleBand(i)})`)
			.selectAll('.cell')
			.delay(funcDelay)
			.attr('x', (_, i) => scaleBand(i))
		t.selectAll('.column')
			.delay(funcDelay)
			.attr('transform', (_, i) => `translate(${scaleBand(i)}) rotate(-90)`)
	})
})