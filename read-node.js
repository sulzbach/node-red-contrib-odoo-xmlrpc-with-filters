module.exports = function (RED) {
    var handle_error = function(err, node, msg) {
        node.status({fill: "red", shape: "dot", text: err.message});
        msg.payload = err;
        node.send([null, msg]);
    };

    function OdooXMLRPCReadNode(config) {
        RED.nodes.createNode(this, config);
        this.host = RED.nodes.getNode(config.host);
        var node = this;

        node.on('input', function (msg) {
            node.status({});
            this.host.connect(function(err, odoo_inst) {
                if (err) {
                    return handle_error(err, node, msg);
                }

                var ids = msg.payload;
                //node.log('Reading ' + ids.length + ' records for model "' + config.model + '"...');
                odoo_inst.execute_kw(config.model, 'read', [[ids]], function (err, value) {
                    if (err) {
                        return handle_error(err, node, msg);
                    }
                    node.status({fill: "green", shape: "dot", text: 'Ok'});
                    msg.payload = value;
                    node.send([msg, null]);
            });
            });
        });
    }
    RED.nodes.registerType("odoo-xmlrpc-read", OdooXMLRPCReadNode);
};
