module.exports = function (RED) {
    var handle_error = function(err, node, msg) {
        node.status({fill: "red", shape: "dot", text: err.message});
        msg.payload = err;
        node.send([null, msg]);
    };

    function OdooXMLRPCCreateNode(config) {
        RED.nodes.createNode(this, config);
        this.host = RED.nodes.getNode(config.host);
        var node = this;

        node.on('input', function (msg) {
            node.status({});
            this.host.connect(function(err, odoo_inst) {
                if (err) {
                    return handle_error(err, node, msg);
                }

                var inParams = [];
                inParams.push(msg.payload);
                var params = [];
                params.push(inParams);
                // console.log('Creating object for model "' + config.model + '"...');
                // console.log(JSON.stringify(params, null, 2));
                odoo_inst.execute_kw(config.model, 'create', params, function (err, value) {
                    if (err) {
                        return handle_error(err, node, msg);
                    }
                    node.status({fill: "green", shape: "dot", text: 'Created'});
                    msg.payload = value;
                    node.send([msg, null]);
                });
            });
        });
    }
    RED.nodes.registerType("odoo-xmlrpc-create", OdooXMLRPCCreateNode);
};
