package com.easymall.controller;

import com.easymall.auth.annotation.CurrentUserId;
import com.easymall.entity.po.Cart;
import com.easymall.entity.result.Result;
import com.easymall.service.CartService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
@Slf4j
public class CartController {

    @Resource
    private CartService cartService;

    @GetMapping
    public Result<List<Cart>> getList(@CurrentUserId String userId) {
        return Result.success(cartService.getList(userId));
    }

    @PostMapping("/add")
    public Result<String> add(@RequestBody Cart cart, @CurrentUserId String userId) {
        if (cart.getQuantity() == null || cart.getQuantity() < 1) {
            cart.setQuantity(1);
        }
        boolean success = cartService.add(cart, userId);
        return success ? Result.success("添加成功") : Result.error("添加失败");
    }

    @PutMapping("/{cartId}/quantity")
    public Result<String> updateQuantity(@PathVariable String cartId,
                                         @RequestParam Integer quantity,
                                         @CurrentUserId String userId) {
        boolean success = cartService.updateQuantity(cartId, quantity, userId);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }

    @PutMapping("/{cartId}/selected")
    public Result<String> updateSelected(@PathVariable String cartId,
                                         @RequestParam Integer selected,
                                         @CurrentUserId String userId) {
        boolean success = cartService.updateSelected(cartId, selected, userId);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }

    @PutMapping("/selected/batch")
    public Result<String> batchUpdateSelected(@RequestBody List<String> cartIds,
                                              @RequestParam Integer selected,
                                              @CurrentUserId String userId) {
        cartService.batchUpdateSelected(cartIds, selected, userId);
        return Result.success("批量更新成功");
    }

    @DeleteMapping("/{cartId}")
    public Result<String> delete(@PathVariable String cartId, @CurrentUserId String userId) {
        boolean success = cartService.delete(cartId, userId);
        return success ? Result.success("删除成功") : Result.error("删除失败");
    }

    @DeleteMapping("/batch")
    public Result<String> batchDelete(@RequestBody List<String> cartIds, @CurrentUserId String userId) {
        cartService.batchDelete(cartIds, userId);
        return Result.success("批量删除成功");
    }

    @DeleteMapping("/clear")
    public Result<String> clear(@CurrentUserId String userId) {
        cartService.clear(userId);
        return Result.success("清空成功");
    }
}