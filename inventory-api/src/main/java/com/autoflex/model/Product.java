package com.autoflex.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

@Entity
public class Product extends PanacheEntity {
    public String name;
    public String code;
    public BigDecimal price;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<ProductRawMaterial> materials = new ArrayList<>();

    public void addRawMaterial(ProductRawMaterial material) {
        materials.add(material);
        material.product = this;
    }
}
