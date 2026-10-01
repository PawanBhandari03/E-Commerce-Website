package com.pawan.ecom_project.controller;

import com.pawan.ecom_project.model.Product;
import com.pawan.ecom_project.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService service;

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProduct() {
        return new ResponseEntity<>(service.getAllProducts(), HttpStatus.OK);
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable int id) {
        return new ResponseEntity<>(service.getProductsById(id), HttpStatus.OK);
    }

    @PostMapping(value = "/product", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> addProduct(@RequestPart Product product,
                                              @RequestPart(required = false) MultipartFile imageFile) throws IOException {
        return new ResponseEntity<>(service.addProduct(product, imageFile), HttpStatus.CREATED);
    }

    @GetMapping("/product/{productId}/image")
    public ResponseEntity<byte[]> getImageByProductId(@PathVariable int productId) {
        Product product = service.getProductsById(productId);
        if (product.getImageData() == null || product.getImageType() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf(product.getImageType()))
                .body(product.getImageData());
    }

    @PutMapping(value = "/product/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> updateProduct(@PathVariable int id,
                                                @RequestPart Product product,
                                                @RequestPart(required = false) MultipartFile imageFile) throws IOException {
        service.updateProduct(id, product, imageFile);
        return new ResponseEntity<>("Updated", HttpStatus.OK);
    }

    @DeleteMapping("/product/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable int id) {
        service.deleteProduct(id);
        return new ResponseEntity<>("Deleted", HttpStatus.OK);
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword) {
        return new ResponseEntity<>(service.searchProducts(keyword), HttpStatus.OK);
    }

    @PostMapping("/checkout")
    public ResponseEntity<String> checkout(@RequestBody List<ProductService.CheckoutItem> items) {
        service.checkout(items);
        return new ResponseEntity<>("Order placed", HttpStatus.OK);
    }
}
