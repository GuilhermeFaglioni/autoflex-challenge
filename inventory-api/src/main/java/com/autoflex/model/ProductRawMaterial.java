package com.autoflex.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class ProductRawMaterial extends PanacheEntity {
    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonIgnore
    public Product product;

    @ManyToOne
    @JoinColumn(name = "raw_material_id")
    public RawMaterial rawMaterial;

    public Integer quantityNeeded;
}