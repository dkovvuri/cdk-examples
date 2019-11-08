import setuptools


with open("README.md") as fp:
    long_description = fp.read()


setuptools.setup(
    name="rds_cluster",
    version="0.0.1",

    long_description_content_type="text/markdown",

    install_requires=[
        "aws-cdk.core",
        "aws-cdk.aws_rds",
        "boto3"
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
