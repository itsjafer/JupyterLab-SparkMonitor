import { Widget } from '@lumino/widgets';
import { MainAreaWidget } from '@jupyterlab/apputils';
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';

export default class SparkUI {
    constructor(port) {
        this.port = port;
        this.iframe = null;
    }

    createSparkUIPanel(app) {
        console.log(SparkUI.widgets);
        if (SparkUI.widgets[this.port]) {
            SparkUI.widgets[this.port].close();
            delete SparkUI.widgets[this.port];
            this.iframe = null;
        }
        const content = new Widget();
        const widget = new MainAreaWidget({ content });
        this.iframe = document.createElement('iframe');
        const button = document.createElement('button');
        button.textContent = 'Reload';
        button.onclick = this.reloadIframe.bind(this);
        const url = URLExt.join(ServerConnection.makeSettings().baseUrl, 'sparkmonitor', this.port);
        content.node.appendChild(button);
        content.node.appendChild(this.iframe);

        this.iframe.setAttribute('style', 'width:100%;height:100%;border:0');
        this.iframe.setAttribute('src', url);
        this.iframe.setAttribute('class', 'sparkUIIFrame');
        widget.id = `spark-ui-${this.port}`;
        widget.title.label = `Spark Web UI (${this.port})`;
        widget.title.closable = true;
        if (!widget.isAttached) {
            if (Object.keys(SparkUI.widgets).length) {
                const refWidget = SparkUI.widgets[Object.keys(SparkUI.widgets)[0]];
                app.shell.add(widget, 'main', { mode: 'tab-before', ref: refWidget.id });
            } else {
                app.shell.add(widget, 'main', { mode: 'split-right' });
            }
        }
        app.shell.activateById(widget.id);
        SparkUI.widgets[this.port] = widget;
    }

    reloadIframe() {
        if (this.iframe) {
            if (SparkUI.widgets[this.port].isVisible) {
                this.iframe.contentWindow.location.reload();
            }
        }
    }
}

SparkUI.widgets = {};
