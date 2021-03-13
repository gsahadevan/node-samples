for file in ./data/*; do 
    if [ -f "$file" ]; then
		sed -i '/^.data/d' $file
		cut -d, -f1 --complement $file > temp && mv temp $file
		sed -i -e '1i'$file'' $file
		echo "$file"	    
    fi 
done

for file in ./data1/*; do 
	if [ -f "$file" ]; then
		cut -d, -f1 --complement $file > temp && mv temp $file
		sed -i -e '1i'$file'' $file
		echo "$file"
    fi 
done

for file in ./data/sample/*; do 
    if [ -f "$file" ]; then 
	    if ["$file" != "total.csv"]; then
			cut -d, -f1 --complement $file > temp && mv temp $file
			sed -i -e '1i$file' $file
			paste -d"," total.csv $file
			echo "$file"
	    fi
    fi 
done

for file in ./copy/*; do 
    if [ -f "$file" ]; then 
	sed -i.bak '/^time/d' $file
	cut -d, -f1,2,3 --complement $file > temp && mv temp $file
	sed -i -e '1i'$file'' $file
	echo "$file"
    fi 
done
