import { PromiseDelegate } from '@lumino/coreutils';

// Logic adapted from https://github.com/deshaw/jupyterlab-execute-time/blob/master/src/ExecuteTimeWidget.ts

export default class CurrentCell {
    constructor(panel) {
        this.isReady = new PromiseDelegate();
        this.cellSlotMap = {};
        this.nb_panel = panel;
        this.activeCell = null;
        this.lastExecutedCell = null;
        this.cellReexecuted = null;
        this.numCellsExecuted = 0;
        this.lastBusySignal = ''; // because the signal is emitted 3 times for every execution. Only want to increment by 1
        this.updateConnectedCell = this.updateConnectedCell.bind(this);
        this.init();
    }

    async init() {
        await this.nb_panel.revealed;
        this.notebook = this.nb_panel.content;

        // Set the recordTiming setting to true
        this.notebook.notebookConfig.recordTiming = true;
        this.registerCells();
        this.isReady.resolve(undefined);
    }

    updateConnectedCell(cells, changed) {
        // While we could look at changed.type, it's easier to just remove all
        // oldValues and add back all new values
        changed.oldValues.forEach(this.deregisterMetadataChanges.bind(this));
        changed.newValues.forEach(this.registerMetadataChanges.bind(this));
    }

    registerMetadataChanges(cellModel) {
        if (!(cellModel.id in this.cellSlotMap)) {
            const fn = () => this.cellMetadataChanged(cellModel);
            this.cellSlotMap[cellModel.id] = fn;
            cellModel.metadata.changed.connect(fn);
            // In case there was already metadata (do not highlight on first load)
            this.cellMetadataChanged(cellModel, true);
        }
    }

    deregisterMetadataChanges(cellModel) {
        const fn = this.cellSlotMap[cellModel.id];
        if (fn) {
            cellModel.metadata.changed.disconnect(fn);
        }
        delete this.cellSlotMap[cellModel.id];
    }

    /**
     * Return a codeCell for this model if there is one. This will return null
     * in cases of non-code cells.
     *
     * @param cellModel
     * @private
     */
    getCodeCell(cellModel) {
        if (cellModel.type === 'code') {
            const cell = this.nb_panel.content.widgets.find((widget) => widget.model === cellModel);
            return cell;
        }
        return null;
    }

    cellMetadataChanged(cellModel) {
        console.log('Cell metadata changed');
        const codeCell = this.getCodeCell(cellModel);
        if (codeCell) {
            const executionMetadata = codeCell.model.metadata.get('execution');
            if (executionMetadata) {
                if (
                    executionMetadata['iopub.status.busy'] &&
                    this.lastBusySignal !== executionMetadata['iopub.status.busy']
                ) {
                    console.log('we have an active cell!');
                    this.activeCell = codeCell;
                    this.cellReexecuted = this.lastExecutedCell === codeCell;
                    this.lastExecutedCell = codeCell;
                    this.numCellsExecuted += 1;
                    this.lastBusySignal = executionMetadata['iopub.status.busy'];
                }
            }
        }
    }

    registerCells() {
        const { cells } = this.nb_panel.context.model;
        cells.changed.connect(this.updateConnectedCell);
        for (let i = 0; i < cells.length; i += 1) {
            this.registerMetadataChanges(cells.get(i));
        }
    }

    getActiveCell() {
        return this.activeCell;
    }

    getCellReexecuted() {
        return this.cellReexecuted;
    }

    getNumCellsExecuted() {
        return this.numCellsExecuted;
    }

    ready() {
        return this.isReady.promise;
    }
}
