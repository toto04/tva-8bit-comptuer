## ⠿⠏⠿⠿⠹⠿⠄⠀⠠⠟⠠⠾⠻⠆
## ⠏⠀⠿⠿⠀⠹⠻⠆⠾⠁⠾⠏⠹⠿⠄
## ⠀⠀⠿⠿⠀⠀⠹⠿⠏⠼⠏⠀⠀⠹⠿⠄
## ⠀⠀~~~ assembler ~~~
# TVA Visive Architecture
This is a quick and dirty assembler written in typescript by someone who has never touched assembly
before this.

The reason this exists is because I personally found it faster to write this piece of junk rather
then programming my 8-bit computer one byte at a time via dip switches. It does the trick.

# Installation
I guess you just need to do
```
yarn
yarn build
yarn link
```
and you're good to go

# Usage
I mean it's not that complicated.
> tva source-file.tva

and a raw binary file will be spat out

you can use the **-o** flag to set the output destination
> tva source-file.tva -o ./path/to/out.bin

and use the **-c** flag to get a C array instead of raw binary
> tva source-file.tva -o ./path/to/out.bin -c