const rimraf = require('rimraf');
const fs = require('fs');
const Product = require('../models/product');
const {logger} = require('../utils/logger');
const {validateProduct} = require('../validations/product')
const {success, err} = require('../utils/responseApi');
const {moveFile} = require('../utils/helper');
const Brand = require('../models/brands')

const createProduct = async (req, res) => {
    logger.info('Start createProduct - - -');
    try {
        const files = req.files;
        const {error, value} = validateProduct(req.body);
        if (error) {
            if (files.length > 0) {
                files.map((file) => {
                    rimraf(`./public/uploads/${file.filename}`, (err) => {
                        if (err) logger.error(err);
                    })
                });
            }
            logger.error('ValidationError', error.message);
            req.flash("error_msg", error.message);
            return res.redirect("/admin-create-product");
        }
        const brandName = await Brand.findById(value.brandId).select('name').lean().exec()
        if (files.length < 2) {
            files.map((file) => {
                rimraf(`./public/uploads/${file.filename}`, (err) => {
                    if (err) logger.error(err);
                })
            });
            if (req.session.language === 'eng') {
                req.flash("error_msg", "*choose images count must be >= 2 or <=5.");
            } else {
                req.flash("error_msg", "* ընտրել պատկերների քանակը պետք է լինի>= 2 կամ <= 5!");
            }
            return res.redirect("/admin-create-product");
        }
        let dir = `./public/uploads/product`;
        if (!fs.existsSync(dir)) {
            fs.mkdir(dir, (err) => {
                if (err) logger.error(err);
            });
        }
        let newProduct;
        const clearProbelsProductType = value.productType.replace(/\s/g, '-');
        const clearProbelsProductTypeArm = value.productTypeArm.replace(/\s/g, '-');

        if (value.productSale != '' || Number(value.productSale) >= 1) {
            newProduct = new Product({
                brandId: value.brandId,
                brandName: brandName.name,
                name: value.productName,
                nameArm: value.productNameArm,
                type: clearProbelsProductType,
                typeArm: clearProbelsProductTypeArm,
                price: value.productPrice,
                sizes: value.productSize.split('/'),
                sale: value.productSale,
                description: value.productDescription,
                descriptionArm: value.productDescriptionArm,
                colors: value.productColor.split('/'),
                productPak3: value.productPak3,
                productPak6: value.productPak6,
                complect: value.complect,
                count: value.productCount,
                productWeight: value.productWeight,
            });
        } else {
            newProduct = new Product({
                brandId: value.brandId,
                brandName: brandName.name,
                name: value.productName,
                nameArm: value.productNameArm,
                type: clearProbelsProductType,
                typeArm: clearProbelsProductTypeArm,
                price: value.productPrice,
                description: value.productDescription,
                descriptionArm: value.productDescriptionArm,
                sizes: value.productSize.split('/'),
                colors: value.productColor.split('/'),
                productPak3: value.productPak3,
                productPak6: value.productPak6,
                complect: value.complect,
                count: value.productCount,
                productWeight: value.productWeight,
            });
        }
        newProduct.images = moveFile(files, dir);
        newProduct.save((err, result) => {
            if (err) {
                files.map((file) => {
                    rimraf(`${dir}/${file.filename}`, (err) => {
                        if (err) logger.error(err);
                    })
                });
                req.flash("error_msg", err.message);
                return res.redirect("/admin-create-product");
            }
            req.flash("success_msg", "Product Add Complete!");
            return res.redirect("/admin-create-product");
        });
    } catch (e) {
        logger.error(`Added Product Error: ${e}`);
        req.flash("error", e.message);
        return res.redirect("/admin-create-product");
    }
}

const deleteProduct = async (req, res) => {
    logger.info('Start deleteProduct - - -');
    const params = req.params;
    try {
        //code must be changed, and optimized
        const product = await Product.findById(params.id).lean();
        product.images.map((item) => {
            rimraf(`./public/${item}`, (err) => {
                if (err) logger.error(err);
            })
        });
        await Product.findByIdAndRemove({_id: params.id}).lean();
        return res.status(200).json({success: true, message: 'Delete Product Completed'});
    } catch (error) {
        logger.error(`Product Delete Error: ${error}`);
        return res.status(500).json(err(error.message, res.statusCode));
    }
}

const updateProduct = async (req, res) => {
    logger.info('Start updateProduct - - -');
    try {
        const files = req.files;
        const _id = req.params._id;
        const product = await Product.findById(_id).exec();
        const {error, value} = validateProduct(req.body);
        if (error && error.details) {
            if (files.length > 0) {
                files.map((file) => {
                    rimraf(`./public/uploads/${file.filename}`, (err) => {
                        if (err) logger.error(err);
                    })
                });
            }
            logger.error(`Validate Error: ${error}`);
            req.flash("error_msg", error);
            return res.redirect(`/admin-editProduct?_id=${_id}`);
        }
        if (files.length < 2) {
            files.map((file) => {
                rimraf(`./public/uploads/${file.filename}`, (err) => {
                    if (err) logger.error(err);
                })
            });
            if (req.session.language === 'eng') {
                req.flash("error_msg", "Files is required!");
            } else {
                req.flash("error_msg", "Ֆայլերը պարտադիր են!");
            }
            return res.redirect(`/admin-editProduct?_id=${_id}`);
        }
        let dir = `./public/uploads/product`;
        if (!fs.existsSync(dir)) {
            fs.mkdir(dir, (err) => {
                if (err) logger.error(err);
            });
        }
        const clearProbelsProductType = value.productType.replace(/\s/g, '-');
        const clearProbelsProductTypeArm = value.productTypeArm.replace(/\s/g, '-');
        product.brandId = value.brandId;
        product.name = value.productName;
        product.nameArm = value.productNameArm;
        product.type = clearProbelsProductType;
        product.typeArm = clearProbelsProductTypeArm;
        product.price = value.productPrice;
        product.sizes = value.productSize.split('/');
        if (value.productSale != '' || Number(value.productSale) >= 1) {
            product.sale = value.productSale;
        }else if(value.productSale == ''){
            product.sale = undefined
        }
        product.productWeight = value.productWeight;
        product.colors = value.productColor.split('/');
        product.productPak3 = value.productPak3;
        product.productPak6 = value.productPak6;
        product.complect =  value.complect;
        product.description = value.productDescription;
        product.descriptionArm = value.productDescriptionArm;
        product.count = value.productCount;

        product.images.map((item) => {
            rimraf(`./public/${item}`, (err) => {
                if (err) logger.error(err);
            })
        });
        product.images = moveFile(files, dir);
        product.save((err, result) => {
            if (err) {
                files.map((file) => {
                    rimraf(`${dir}/${file.filename}`, (err) => {
                        if (err) logger.error(err);
                    })
                });
                req.flash("error_msg", err.message);
                return res.redirect(`/admin-editProduct?_id=${_id}`);
            }
            req.flash("success_msg", "Product Update Completed!");
            return res.redirect(`/admin-editProduct?_id=${_id}`);
        });
    } catch (e) {
        const _id = req.params._id;
        logger.error(`Product Update Error: ${e}`);
        req.flash("error_msg", e.message);
        return res.redirect(`/admin-editProduct?_id=${_id}`);
    }
}

const getProducts = async (req, res) => {
    logger.info('Start getProducts - - -');
    try {
        const {filterByType} = req.body;
        let data;
        if (filterByType) {
            data = await Product.find({type: filterByType});
        } else {
            data = await Product.find({}).sort({name:1});
        }
        return res.status(200).json(success('Products Data!', {
            data
        }, res.statusCode));

    } catch (e) {
        logger.error(`Get Products Error: ${e}`);
        return res.status(500).json(err(e.message, res.statusCode));
    }
}
const getProductsUniqType = async (req, res) => {
    logger.info('Start getProductsUniqType - - -');
    try {

       let template;
        if(req.session.language == 'eng'){
          template =  Product.aggregate([
                {
                    $group:{
                        _id:'$type',
                        "name":{ "$first": '$name'},
                        "type":{ "$first": '$type'},
                        "images":{ "$first": '$images'},
                    }
                }
            ])
        }else{
           template =  Product.aggregate([
                {
                    $group:{
                        _id:'$typeArm',
                        "nameArm":{ "$first": '$nameArm'},
                        "typeArm":{ "$first": '$typeArm'},
                        "images":{ "$first": '$images'},
                    }
                }
            ])
        }
        const data = await template
        return res.status(200).json(success('Products Data!',
            data
        , res.statusCode));

    } catch (e) {
        logger.error(`Get Products Error: ${e}`);
        return res.status(500).json(err(e.message, res.statusCode));
    }
}

const getProductsShopFilter = async (req, res) => {
    logger.info('Start getProductsShopFilter - - -')
    try {
        if (req.session.language === undefined) {
            req.session.language = 'eng';
        }
        const page = Number(req.body.page) || 1;
        const limit = 21;
        const options = {
            page: page,
            limit: limit,
            sort:{date:-1}

        }
        const types = req.body['types[]'] || req.body.type || [];
        const brandId = req.body['brandId[]'] || req.body.brandId || [];
        const searchValue = req.body.searchValue || '';
        const onSale = req.body.onSale ? true : false;
        const {priceFrom, priceTo} = req.body
        let search;
        if (req.session.language === 'eng') {
            search = {
                $and: [
                    {
                        '$or': [
                            {'name': {'$regex': searchValue, "$options": "i"}},
                        ]
                    }

                ]
            };
        } else {
            search = {
                $and: [
                    {
                        '$or': [
                            {'nameArm': {'$regex': searchValue, "$options": "i"}},
                        ]
                    }

                ]
            };
        }

        if (onSale) {
            search['$and'].push({sale: {$exists: true}});
        }
        let data;
        if (!brandId.length && !types.length && searchValue === undefined) {
            data = await Product.paginate({}, options);
        } else if (Number(priceTo) && Number(priceFrom) >= 0 && brandId.length > 0 && types.length > 0) {
            search['$and'].push({price: {$gt: Number(priceFrom), $lte: Number(priceTo)}});
            if (req.session.language === 'eng') {
                search['$and'].push({type: {"$in": types}});
            } else {
                search['$and'].push({typeArm: {"$in": types}});
            }
            search['$and'].push({brandId: {"$in": brandId}});
            data = await Product.paginate(search, options);
        } else if (Number(priceTo) && Number(priceFrom) >= 0 && brandId.length > 0) {
            search['$and'].push({price: {$gt: Number(priceFrom), $lte: Number(priceTo)}});
            search['$and'].push({brandId: {"$in": brandId}});
            data = await Product.paginate(search, options);
        } else if (Number(priceTo) && Number(priceFrom) >= 0 && types.length > 0) {
            search['$and'].push({price: {$gt: Number(priceFrom), $lte: Number(priceTo)}});
            if (req.session.language === 'eng') {
                search['$and'].push({type: {"$in": types}});
            } else {
                search['$and'].push({typeArm: {"$in": types}});
            }
            data = await Product.paginate(search, options);
        } else if (Number(priceTo) && Number(priceFrom) >= 0) {
            search['$and'].push({price: {$gt: Number(priceFrom), $lte: Number(priceTo)}});
            data = await Product.paginate(search, options);
        } else if (brandId.length > 0 && types.length > 0) {
            search['$and'].push({brandId: {"$in": brandId}});
            if (req.session.language === 'eng') {
                search['$and'].push({type: {"$in": types}});
            } else {
                search['$and'].push({typeArm: {"$in": types}});
            }
            data = await Product.paginate(search, options);
        } else if (brandId.length > 0) {
            search['$and'].push({brandId: {"$in": brandId}});
            data = await Product.paginate(search, options);
        } else if (types.length > 0) {
            if (req.session.language === 'eng') {
                search['$and'].push({type: {"$in": types}});
            } else {
                search['$and'].push({typeArm: {"$in": types}});
            }
            data = await Product.paginate(search, options);
        } else {
            data = await Product.paginate(search, options);
        }
        return res.status(200).json(success('Products Data Shop!', {
            data: data.docs,
            pageCount: data.pages,
        }, res.statusCode));

    } catch (e) {
        logger.error(`Get Products Error: ${e}`);
        return res.status(500).json(err(e.message, res.statusCode));
    }

}

const getProductById = async (req, res) => {
    logger.info('Get Product By Id - - -');
    try {
        if (req.body.productCount && req.body.productId) {
            const product = await Product.findById(req.body.productId).populate('brandId').exec();
            if (Number(product.count) >= Number(req.body.productCount)) {
                return res.status(200).json(success('Product exists',
                    product, res.statusCode));
            } else {
                let mes;
                if (Number(product.count) === 0) {
                    if (req.session.language === 'eng') {
                        mes = 'Out of stock.';
                    } else {
                        mes = 'Առկա չէ պահեստում:';
                    }
                } else {
                    if (req.session.language === 'eng') {
                        mes = `You cannot add that amount to the cart — we have ${product.count}  in stock and you already have ${product.count}  in your cart.`;
                    } else {
                        mes = `Դուք չեք կարող ավելացնել այս ապրանքատեսակից ձեր զամբյուղում․ Մեր պահեստում մնացել է ${product.count} հատ:`;
                    }
                }
                return res.send({message: mes, error: true});
                // return res.status(500).json(err(mes, res.statusCode));
            }
        } else {
            const ids = req.body['shoppingCard[]'];
            const products = await Product.find({_id: {"$in": ids}}).populate('brandId').lean().exec();
            return res.status(200).json(success('Products Data Shopping Card!',
                products, res.statusCode));
        }
    } catch (e) {
        logger.error(`Get Product by Id: ${e}`);
        return res.status(500).json(err(e.message, res.statusCode));
    }
}

const getDataSearch = async (req, res) => {
    logger.info(`Get Data Search  - - - `);
    const {search} = req.body;
    const searchFilterBrand = {
        $and: [
            {
                '$or': [
                    {'name': {'$regex': search, "$options": "i"}},
                ]
            }

        ]
    };
    let searchFilterProduct
    if (req.session.language === 'eng') {
        searchFilterProduct = {
            $and: [
                {
                    '$or': [
                        {'name': {'$regex': search, "$options": "i"}},
                    ]
                }

            ]
        };
    } else {
        searchFilterProduct = {
            $and: [
                {
                    '$or': [
                        {'nameArm': {'$regex': search, "$options": "i"}},
                    ]
                }

            ]
        };
    }
    let arrayProduct;
    if (req.session.language === 'eng') {
        arrayProduct = await Product.find(searchFilterProduct).select('name type').lean();

    } else {
        arrayProduct = await Product.find(searchFilterProduct).select('nameArm typeArm').lean();
    }
    Promise.all([
        arrayProduct,
        Brand.find(searchFilterBrand).select('name')
    ]).then(([products, brands]) => {
        return res.status(200).json(success('Get Data Search!',
            {products: products, brands: brands}, res.statusCode));
    })
        .catch((e) => {
            logger.error(`Get Data Search Error: ${e}`);
            return res.json(500).json(err(e.message, res.statusCode));
        })
}

module.exports = {
    createProduct: createProduct,
    deleteProduct: deleteProduct,
    updateProduct: updateProduct,
    getProducts: getProducts,
    getProductsShopFilter: getProductsShopFilter,
    getProductById: getProductById,
    getDataSearch: getDataSearch,
    getProductsUniqType:getProductsUniqType
};






