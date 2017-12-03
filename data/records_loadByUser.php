<?php
    header('Content-Type:application/json');
    $uid=$_REQUEST['uid'];
    $output=[];
    $conn=mysqli_connect('127.0.0.1','root','','Gobang',3306);
    mysqli_query($conn,'SET NAMES UTF8');
    $sql="SELECT * FROM userRecords WHERE uid=$uid";
    $result=mysqli_query($conn,$sql);
    if(!$result){
        $output['msg']='fail';
        $output['reason']='SQL语句错误：'.$sql;
        return;
    }
    while($row=mysqli_fetch_assoc($result)){
        $output[]=$row;
    }
    echo json_encode($output);