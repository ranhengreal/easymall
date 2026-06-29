package com.easymall.entity.dto;

import com.easymall.entity.po.Order;
import com.easymall.entity.po.OrderItem;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OrderDTO {

    @Data
    public static class Response {
        private String orderId;
        private String orderSn;
        private String userId;
        private String userName;
        private BigDecimal totalAmount;
        private BigDecimal discountAmount;
        private BigDecimal freightAmount;
        private BigDecimal payAmount;
        private BigDecimal productTotal;
        private Integer payType;
        private Integer payStatus;
        private LocalDateTime payTime;
        private Integer orderStatus;
        private String orderStatusName;
        private String receiverName;
        private String receiverPhone;
        private String receiverProvince;
        private String receiverCity;
        private String receiverDistrict;
        private String receiverAddress;
        private String receiverZip;
        private String userNote;
        private String cancelReason;
        private LocalDateTime createTime;
        private LocalDateTime updateTime;
        private LocalDateTime shipTime;
        private LocalDateTime receiveTime;
        private List<OrderItemResponse> items;
        private String remark;

        public static Response fromPO(Order order) {
            if (order == null) {
                return null;
            }
            Response resp = new Response();
            resp.setOrderId(order.getOrderId());
            resp.setOrderSn(order.getOrderSn());
            resp.setUserId(order.getUserId());
            resp.setUserName(order.getUserName());
            resp.setTotalAmount(order.getTotalAmount());
            resp.setDiscountAmount(order.getDiscountAmount());
            resp.setFreightAmount(order.getFreightAmount());
            resp.setPayAmount(order.getPayAmount());
            resp.setProductTotal(order.getTotalAmount());
            resp.setPayType(order.getPayType());
            resp.setPayStatus(order.getPayStatus());
            resp.setPayTime(order.getPayTime());
            resp.setOrderStatus(order.getOrderStatus());
            resp.setOrderStatusName(getStatusName(order.getOrderStatus()));
            resp.setReceiverName(order.getReceiverName());
            resp.setReceiverPhone(order.getReceiverPhone());
            resp.setReceiverProvince(order.getReceiverProvince());
            resp.setReceiverCity(order.getReceiverCity());
            resp.setReceiverDistrict(order.getReceiverDistrict());
            resp.setReceiverAddress(order.getReceiverAddress());
            resp.setReceiverZip(order.getReceiverZip());
            resp.setUserNote(order.getUserNote());
            resp.setCancelReason(order.getCancelReason());
            resp.setCreateTime(order.getCreateTime());
            resp.setUpdateTime(order.getUpdateTime());
            resp.setRemark(order.getRemark());
            resp.setShipTime(order.getShipTime());
            resp.setReceiveTime(order.getReceiveTime());
            // Map items
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                List<OrderItemResponse> itemList = new ArrayList<>();
                for (OrderItem item : order.getItems()) {
                    OrderItemResponse itemResp = new OrderItemResponse();
                    itemResp.setItemId(item.getItemId());
                    itemResp.setOrderId(item.getOrderId());
                    itemResp.setProductId(item.getProductId());
                    itemResp.setProductName(item.getProductName());
                    itemResp.setProductImage(item.getProductImage());
                    itemResp.setSkuId(item.getSkuId());
                    itemResp.setSpecValues(item.getSpecValues());
                    itemResp.setPrice(item.getPrice());
                    itemResp.setQuantity(item.getQuantity());
                    itemResp.setTotalAmount(item.getTotalAmount());
                    itemResp.setCreateTime(item.getCreateTime());
                    itemList.add(itemResp);
                }
                resp.setItems(itemList);
            } else {
                resp.setItems(new ArrayList<>());
            }
            return resp;
        }

        private static String getStatusName(Integer status) {
            String[] names = {"待付款", "待发货", "待收货", "已完成", "已取消", "售后中"};
            if (status != null && status >= 0 && status < names.length) {
                return names[status];
            }
            return "未知";
        }
    }

    @Data
    public static class Create {
        private String receiverName;
        private String receiverPhone;
        private String receiverProvince;
        private String receiverCity;
        private String receiverDistrict;
        private String receiverAddress;
        private String receiverZip;
        private String userNote;
        private List<OrderItemCreate> items;
        private Integer payType;
    }

    @Data
    public static class OrderItemCreate {
        private String productId;
        private String skuId;
        private Integer quantity;
    }

    @Data
    public static class OrderItemResponse {
        private String itemId;
        private String orderId;
        private String productId;
        private String productName;
        private String productImage;
        private String skuId;
        private String specValues;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal totalAmount;
        private LocalDateTime createTime;
    }

    @Data
    public static class Query {
        private String orderSn;
        private String userName;
        private Integer orderStatus;
        private Integer payStatus;
        private String startTime;
        private String endTime;
        private Integer pageNum;
        private Integer pageSize;
    }

    @Data
    public static class Update {
        private Integer orderStatus;
        private Integer payStatus;
        private Integer payType;
        private String cancelReason;
        private String logisticsCompany;
        private String trackingNumber;
    }
}
