package com.easymall.service;

import com.easymall.entity.po.Cart;
import java.util.List;

public interface CartService {

    List<Cart> getList(String userId);

    List<Cart> getSelectedList(String userId);

    boolean add(Cart cart, String userId);

    // 以下方法增加 userId 参数
    boolean updateQuantity(String cartId, Integer quantity, String userId);

    boolean updateSelected(String cartId, Integer selected, String userId);

    void batchUpdateSelected(List<String> cartIds, Integer selected, String userId);

    boolean delete(String cartId, String userId);

    void batchDelete(List<String> cartIds, String userId);

    void clear(String userId);
}