function isDefinedValue(v){
  return !(v == null || typeof v === 'undefined');
}

function isUInt(v){
  return typeof v === 'number' && Math.floor(v) === v && v >= 0;
}

module.exports = function (RED) {
    var handle_error = function(err, node, msg) {
      node.status({fill: "red", shape: "dot", text: err.message});
      msg.payload = err;
      node.send([null, msg]);
    };

    function OdooXMLRPCSearchNode(config) {
        RED.nodes.createNode(this, config);
        this.host = RED.nodes.getNode(config.host);
        var node = this;

        node.on('input', function (msg) {
            node.status({});
            this.host.connect(function(err, odoo_inst) {
                if (err) {
                    return handle_error(err, node, msg);
                }

                var offset = msg.offset;
                if (isDefinedValue(offset) && !isUInt(offset)){
                  return handle_error(new Error('When offset is provided, it must be a positive integer number'), node, msg);
                }
                var limit = msg.limit;
                if (isDefinedValue(limit) && !isUInt(limit)){
                  return handle_error(new Error('When limit is provided, it must be a positive integer number'), node, msg);
                }

                var inParams;
                if (msg.filters){
                  if (!Array.isArray(msg.filters)){
                    return handle_error(new Error('When filters is provided, it must be an array'), node, msg);
                  }
                  inParams = msg.filters;
                } else {
                  inParams = [];
                  inParams.push([]);
                }
                var params = [];
                params.push(inParams);
                //node.log('Searching for model "' + config.model + '"...');
                odoo_inst.execute_kw(config.model, 'search', params, function (err, value) {
                    if (err) {
                        return handle_error(err, node, msg);
                    }

                    if (isDefinedValue(offset)){
                      //Jump the x first elements (where x has the value of the "offset" variable)
                      value = value.slice(offset);
                    }
                    if (isDefinedValue(limit)){
                      //Limit the length of the value array to x elements (where x has the value of the "limit" variable)
                      value = value.slice(0, limit);
                    }
                    node.status({fill: "green", shape: "dot", text: 'Ok'});
                    msg.payload = value;
                    node.send([msg, null]);
                });
            });
        });
    }
    RED.nodes.registerType("odoo-xmlrpc-search", OdooXMLRPCSearchNode);
};
