import setuptools


with open("README.md") as fp:
    long_description = fp.read()


setuptools.setup(
    name="cloudfront",
    version="1.0.0",

    description="CDK project that creates a CloudFront Distribution with Viewer Certificates",
    long_description=long_description,
    long_description_content_type="text/markdown",

    author="author",

    package_dir={"": "cloudfront"},
    packages=setuptools.find_packages(where="cloudfront"),

    install_requires=[
        "aws-cdk.core",
        "aws_cdk.aws_certificatemanager",
        "aws_cdk.aws_route53",
        "aws_cdk.aws_cloudfront"
    ],

    python_requires=">=3.6",

    classifiers=[
        "Development Status :: 4 - Beta",

        "Intended Audience :: Developers",

        "License :: OSI Approved :: Apache Software License",

        "Programming Language :: JavaScript",
        "Programming Language :: Python :: 3 :: Only",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",

        "Topic :: Software Development :: Code Generators",
        "Topic :: Utilities",

        "Typing :: Typed",
    ],
)
