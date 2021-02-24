import React from 'react'
import { Trans } from 'react-i18next'
import { Link } from 'react-router-dom'

const OrderDefaultValueList = ({ data, handleDelete }) => {
  return data.map(o => (
    <div className="card mb-2" key={o.id}>
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between">
          <h5>{o.title}</h5>
          <div>
            <Link to={`/configure-default-values/${o.id}/edit`} className="btn btn-xs btn-primary mr-2"><i className="fa fa-edit"></i></Link>
            <button className="btn btn-xs btn-danger"
              onClick={e => {
                if (window.confirm('Delete this order default value ?')) {
                  handleDelete(o.id)}
                }
              }>
              <i className="fa fa-times"></i>
            </button>
          </div>
        </div>
        <div className="d-flex mt-3">
          <div className="mr-4">
            <p><Trans i18nKey='orders.pickupCountry' />: <strong>{o.pickup_country}</strong></p>
            <p><Trans i18nKey='orders.service' />: {o.service ? <strong>{o.service.service_name}</strong>: '-'}</p>
            <p><Trans i18nKey='orders.pickupAddress' />: {o.pickup_point ? <strong>{o.pickup_point.pickup_point_name} ({ o.pickup_point.pickup_point_country })</strong>:'-'}</p>
            <p><Trans i18nKey='orders.itemCategory' />: <strong>{o.item_category}</strong></p>
          </div>
          <div>
            <p><Trans i18nKey='orders.orderLength' />: <strong>{o.order_length} cm</strong></p>
            <p><Trans i18nKey='orders.orderWidth' />: <strong>{o.order_height} cm</strong></p>
            <p><Trans i18nKey='orders.orderHeight' />: <strong>{o.order_width} cm</strong></p>
            <p><Trans i18nKey='orders.orderWeight' />: <strong>{o.order_weight} kg</strong></p>
          </div>
        </div>
      </div>
    </div>
  ))
}

export default OrderDefaultValueList