/**
 * Module to display a popup with details of a task.
 * @module taskdetails
 */

import './taskdetails.css'; // CSS styles
import $ from 'jquery'; // jQuery to manipulate the DOM
import moment from 'moment'; // moment to format date objects

/**
 * Fills data in the template HTML element.
 * @param {Object} element - the HTML element
 * @param {Object} item - data about the task.
 */
function fillData(element, item) {
    const { data } = item;
    element.find('.data-taskid').text(data.taskId);
    element.find('.data-stageid').text(data.stageId);
    element.find('.data-host').text(data.host);
    element.find('.data-executorid').text(data.executorId);
    const status = $('<span></span>').addClass(data.status).text(data.status);
    element.find('.data-status').html(status);
    const start = $('<time></time>')
        .addClass('timeago')
        .attr('data-livestamp', new Date(data.launchTime))
        .attr('title', new Date(data.launchTime).toString())
        .livestamp(new Date(data.launchTime));
    element.find('.data-launchtime').html(start);
    if (data.finishTime) {
        const end = $('<time></time>')
            .addClass('timeago')
            .attr('data-livestamp', new Date(data.finishTime))
            .attr('title', new Date(data.finishTime).toString())
            .livestamp(new Date(data.finishTime));
        element.find('.finish').show();
        element.find('.data-finishtime').html(end);
        const duration = moment.duration(new Date(data.finishTime).getTime() - new Date(data.launchTime).getTime());
        element.find('.data-duration').text(duration.format('d[d] h[h]:mm[m]:ss[s]:SS[ms]'));
    }
    if (data.status === 'FAILED' || data.status === 'KILLED') {
        element.find('.error').show();
        element.find('.data-error').text(data.errorMessage);
    }
    if (data.status === 'SUCCESS' || data.status === 'FAILED' || data.status === 'KILLED') {
        const { metrics } = data;
        element.find('.metricdata').show();
        const e = element.find('.legend-area');
        const svg = element.find('.taskbarsvg');
        const format = 'd[d] h[h]:mm[m]:ss[s]:SS[ms]';
        svg.find('.scheduler-delay-proportion')
            .attr('x', `${metrics.schedulerDelayProportionPos}%`)
            .attr('width', `${metrics.schedulerDelayProportion}%`);
        e.find('.scheduler-delay').text(moment.duration(metrics.schedulerDelay).format(format));

        svg.find('.deserialization-time-proportion')
            .attr('x', `${metrics.deserializationTimeProportionPos}%`)
            .attr('width', `${metrics.deserializationTimeProportion}%`);
        e.find('.deserialization-time').text(moment.duration(metrics.deserializationTime).format(format));

        svg.find('.shuffle-read-time-proportion')
            .attr('x', `${metrics.shuffleReadTimeProportionPos}%`)
            .attr('width', `${metrics.shuffleReadTimeProportion}%`);
        e.find('.shuffle-read-time').text(moment.duration(metrics.shuffleReadTime).format(format));

        svg.find('.executor-runtime-proportion')
            .attr('x', `${metrics.executorComputingTimeProportionPos}%`)
            .attr('width', `${metrics.executorComputingTimeProportion}%`);
        e.find('.executor-runtime').text(moment.duration(metrics.executorComputingTime).format(format));

        svg.find('.shuffle-write-time-proportion')
            .attr('x', `${metrics.shuffleWriteTimeProportionPos}%`)
            .attr('width', `${metrics.shuffleWriteTimeProportion}%`);
        e.find('.shuffle-write-time').text(moment.duration(metrics.shuffleWriteTime).format(format));

        svg.find('.serialization-time-proportion')
            .attr('x', `${metrics.serializationTimeProportionPos}%`)
            .attr('width', `${metrics.serializationTimeProportion}%`);
        e.find('.serialization-time').text(moment.duration(metrics.serializationTime).format(format));

        svg.find('.getting-result-time-proportion')
            .attr('x', `${metrics.gettingResultTimeProportionPos}%`)
            .attr('width', `${metrics.gettingResultTimeProportion}%`);
        e.find('.getting-result-time').text(moment.duration(metrics.gettingResultTime).format(format));
    }
}

function createRect(className, x, y, height, width) {
    const rect = document.createElement('rect');
    rect.className = className;
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('height', height);
    rect.setAttribute('width', width);

    return rect;
}

/**
 * Shows a popup dialog with details of a task.
 * @param {Object} item - data about the task.
 */
function showTaskDetails(item) {
    const taskdetails = document.createElement('div');
    taskdetails.className = 'taskdetails';
    const tasktitle = document.createElement('div');
    tasktitle.className = 'tasktitle';
    tasktitle.innerHTML = `Task <span class="data-taskid">5</span><span class="tasktitlestage">from Stage  <span class="data-stageid">6</span></span>`;
    const metricdata = document.createElement('div');
    metricdata.className = 'metricdata';
    const taskbarsvg = document.createElement('svg');
    taskbarsvg.className = 'taskbarsvg';

    const scheduler_delay_proportion = createRect('scheduler-delay-proportion', '0%', '0px', '100%', '10%');
    const deserialization_time_proportion = createRect('deserialization-time-proportion', '10%', '0px', '100%', '10%');
    const shuffle_read_time_proportion = createRect('shuffle-read-time-proportion', '20%', '0px', '100%', '20%');
    const executor_runtime_proportion = createRect('executor-runtime-proportion', '40%', '0px', '100%', '10%');
    const shuffle_write_time_proportion = createRect('shuffle-write-time-proportion', '50%', '0px', '100%', '10%');
    const serialization_time_proportion = createRect('serialization-time-proportion', '60%', '0px', '100%', '20%');
    const getting_result_time_proportion = createRect('getting-result-time-proportion', '80%', '0px', '100%', '20%');

    taskbarsvg.appendChild(scheduler_delay_proportion);
    taskbarsvg.appendChild(deserialization_time_proportion);
    taskbarsvg.appendChild(shuffle_read_time_proportion);
    taskbarsvg.appendChild(executor_runtime_proportion);
    taskbarsvg.appendChild(shuffle_write_time_proportion);
    taskbarsvg.appendChild(serialization_time_proportion);
    taskbarsvg.appendChild(getting_result_time_proportion);
    metricdata.appendChild(taskbarsvg);
    tasktitle.appendChild(metricdata);

    const legendArea = document.createElement('div');
    legendArea.classList.add('legend-area');
    legendArea.classList.add('metricdata');
    legendArea.insertAdjacentText('afterbegin', 'Metrics:');
    const table = document.createElement('table');
    const tableHead = document.createElement('thead');
    tableHead.innerHTML = `<tr>
        <th></th>
        <th>Phase</th>
        <th>Time Taken</th>
    </tr>`;

    const tableBody = document.createElement('tbody');
    const classes = [
        'scheduler-delay',
        'deserialization-time',
        'shuffle-read-time',
        'executor-runtime',
        'shuffle-write-time',
        'serialization-time',
        'getting-result-time',
    ];

    for (let i = 0; i < classes.length; i += 1) {
        const row = document.createElement('tr');
        const svgCell = document.createElement('td');
        const svg = document.createElement('svg');
        svgCell.innerHTML = `<rect x="0px" y="0px" width="10px" height="10px" class="${classes[i]}-proportion"></rect>`;
        const className = document.createElement('td');
        className.innerText = classes[i].replace(/-/g, ' ');
        const valueCell = document.createElement('td');
        valueCell.className = classes[i];
        valueCell.innerText = '0';

        svgCell.appendChild(svg);
        row.appendChild(svgCell);
        row.appendChild(className);
        row.appendChild(valueCell);
        tableBody.appendChild(row);
    }

    table.appendChild(tableHead);
    table.appendChild(tableBody);
    legendArea.appendChild(table);

    taskdetails.appendChild(tasktitle);
    taskdetails.appendChild(legendArea);

    taskdetails.insertAdjacentText('beforeend', 'Other Details:');

    const otherTable = document.createElement('table');
    const otherTableHead = document.createElement('thead');
    otherTableHead.innerHTML = `<tr>
        <th>Parameter</th>
        <th>Value</th>
    </tr>`;

    const otherTableBody = document.createElement('tbody');
    const otherClasses = ['Launch Time', 'Finish Time', 'Duration', 'Executor Id', 'Host', 'Status'];

    for (let i = 0; i < otherClasses.length; i += 1) {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        nameCell.innerText = otherClasses[i];
        const valueCell = document.createElement('td');
        valueCell.className = `data-${otherClasses[i].toLowerCase().replace(/\s/g, '')}`;
        valueCell.innerText = '0';

        row.appendChild(nameCell);
        row.appendChild(valueCell);
        otherTableBody.appendChild(row);
    }

    const errorRow = document.createElement('tr');
    errorRow.className = 'error';
    errorRow.innerHTML = `<td>Error Message</td><td> <pre class="data-error"></pre></td>`;
    otherTableBody.appendChild(errorRow);

    otherTable.appendChild(otherTableHead);
    otherTable.appendChild(otherTableBody);
    taskdetails.appendChild(otherTable);

    const div = $(taskdetails);
    fillData(div, item);
    const options = {
        title: 'Task Details',
        width: 800,
        height: 500,
        autoResize: false,
        dialogClass: 'task-dialog',
        position: { my: 'right', at: 'right', of: window }, // noqa
    };
    div.dialog(options);
}

export default {
    show: showTaskDetails,
};
