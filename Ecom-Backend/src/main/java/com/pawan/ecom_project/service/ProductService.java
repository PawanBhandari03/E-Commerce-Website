package com.pawan.ecom_project.service;

import com.pawan.ecom_project.model.Product;
import com.pawan.ecom_project.repo.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepo repo;

    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public Product getProductsById(int id) {
        return repo.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Product " + id + " not found"));
    }

    public Product addProduct(Product product, MultipartFile imageFile) throws IOException {
        product.setId(null);
        applyImage(product, imageFile);
        product.setProductAvailable(product.getStockQuantity() != null && product.getStockQuantity() > 0);
        return repo.save(product);
    }

    public Product updateProduct(int id, Product product, MultipartFile imageFile) throws IOException {
        Product existing = getProductsById(id);
        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setBrand(product.getBrand());
        existing.setPrice(product.getPrice());
        existing.setCategory(product.getCategory());
        existing.setReleaseDate(product.getReleaseDate());
        existing.setImageUrl(product.getImageUrl());
        existing.setStockQuantity(product.getStockQuantity());
        existing.setProductAvailable(product.getStockQuantity() != null && product.getStockQuantity() > 0);
        applyImage(existing, imageFile);
        return repo.save(existing);
    }

    public void deleteProduct(int id) {
        getProductsById(id);
        repo.deleteById(id);
    }

    public List<Product> searchProducts(String keyword) {
        return repo.searchProducts(keyword);
    }

    /** Decrements stock for each purchased item; all-or-nothing. */
    @Transactional
    public void checkout(List<CheckoutItem> items) {
        for (CheckoutItem item : items) {
            Product p = getProductsById(item.id());
            int stock = p.getStockQuantity() == null ? 0 : p.getStockQuantity();
            if (item.quantity() <= 0 || item.quantity() > stock) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Not enough stock for " + p.getName());
            }
            p.setStockQuantity(stock - item.quantity());
            p.setProductAvailable(p.getStockQuantity() > 0);
            repo.save(p);
        }
    }

    public record CheckoutItem(int id, int quantity) {}

    private void applyImage(Product product, MultipartFile imageFile) throws IOException {
        if (imageFile != null && !imageFile.isEmpty()) {
            product.setImageName(imageFile.getOriginalFilename());
            product.setImageType(imageFile.getContentType());
            product.setImageData(imageFile.getBytes());
        }
    }
}
