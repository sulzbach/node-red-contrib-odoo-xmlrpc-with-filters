module.exports = function (RED) {
    var handle_error = function(err, node, msg) {
        node.status({fill: "red", shape: "dot", text: err.message});
        msg.payload = err.message;
        node.send([null, msg]);
    };

    function OdooXMLRPCUpdateNode(config) {
        RED.nodes.createNode(this, config);
        this.host = RED.nodes.getNode(config.host);
        var node = this;

        node.on('input', function (msg) {
            node.status({});
            this.host.connect(function(err, odoo_inst) {
                if (err) {
                    return handle_error(err, node, msg);
                }

                var inParams;
                if (msg.payload){
                  if (!Array.isArray(msg.payload)){
                    return handle_error('when defined, msg.payload must be an array', node, msg);
                  }
                  inParams = msg.payload
                } else {
                  inParams = [];
                  inParams.push([]);
                }

                var params = [];
                params.push(inParams);
                // console.log('Updating object for model "' + config.model);
                // console.log(JSON.stringify(params, null, 2));
                odoo_inst.execute_kw(config.model, 'write', params, function (err, value) {
                    if (err) {
                        return handle_error(err, node, msg);
                    }
                    node.status({fill: "green", shape: "dot", text: 'Updated'});
                    msg.payload = value;
                    node.send([msg, null]);

                });
            });
        });
    }
    RED.nodes.registerType("odoo-xmlrpc-update", OdooXMLRPCUpdateNode);
};
